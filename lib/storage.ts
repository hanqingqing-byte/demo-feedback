import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { Demo, DemoImage, Database, Feedback } from "@/lib/types";
import { createId, createShareToken, sanitizeFileName } from "@/lib/utils";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/env";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "db.json");
const uploadsDir = path.join(process.cwd(), "public", "uploads");
const demoBucket = "demo-images";

const emptyDb: Database = { demos: [] };

type CreateDemoInput = {
  creatorId?: string | null;
  title: string;
  description: string;
  imageFiles: File[];
};

type FeedbackInput = {
  nickname: string;
  content: string;
  deviceType: string;
};

type SupabaseDemoRow = {
  id: string;
  creator_id: string | null;
  title: string;
  description: string | null;
  share_token: string;
  created_at: string;
  updated_at: string;
  demo_images?: Array<{
    id: string;
    image_url: string;
    image_path: string | null;
    sort_order: number;
    file_name: string;
  }> | null;
  feedback?: Array<{
    id: string;
    demo_id: string;
    nickname: string | null;
    content: string;
    device_type: string;
    created_at: string;
  }> | null;
};

function getSupabaseAdminClient() {
  const { url, serviceRoleKey } = getSupabaseEnv();

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

function mapDemoRow(row: SupabaseDemoRow): Demo {
  const images: DemoImage[] = [...(row.demo_images ?? [])]
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((image) => ({
      id: image.id,
      url: image.image_url,
      path: image.image_path,
      sortOrder: image.sort_order,
      fileName: image.file_name
    }));

  const feedback: Feedback[] = [...(row.feedback ?? [])]
    .sort((left, right) => right.created_at.localeCompare(left.created_at))
    .map((item) => ({
      id: item.id,
      demoId: item.demo_id,
      nickname: item.nickname ?? "",
      content: item.content,
      deviceType: item.device_type,
      createdAt: item.created_at
    }));

  return {
    id: row.id,
    creatorId: row.creator_id,
    title: row.title,
    description: row.description ?? "",
    shareToken: row.share_token,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    images,
    feedback
  };
}

async function ensureLocalStorage() {
  await mkdir(dataDir, { recursive: true });
  await mkdir(uploadsDir, { recursive: true });

  try {
    await readFile(dbPath, "utf8");
  } catch {
    await writeFile(dbPath, JSON.stringify(emptyDb, null, 2), "utf8");
  }
}

async function readLocalDb(): Promise<Database> {
  await ensureLocalStorage();
  const raw = await readFile(dbPath, "utf8");
  return JSON.parse(raw) as Database;
}

async function writeLocalDb(db: Database) {
  await ensureLocalStorage();
  await writeFile(dbPath, JSON.stringify(db, null, 2), "utf8");
}

async function listLocalDemosForCreator(creatorId?: string | null) {
  const db = await readLocalDb();
  const demos = creatorId ? db.demos.filter((demo) => demo.creatorId === creatorId) : db.demos;
  return [...demos].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function getLocalDemoByToken(shareToken: string) {
  const db = await readLocalDb();
  return db.demos.find((demo) => demo.shareToken === shareToken) ?? null;
}

async function createLocalDemo({ creatorId, title, description, imageFiles }: CreateDemoInput) {
  await ensureLocalStorage();

  const createdAt = new Date().toISOString();
  const demoId = createId("demo");
  const shareToken = createShareToken();

  const images = await Promise.all(
    imageFiles.map(async (file, index) => {
      const extension = path.extname(file.name) || ".png";
      const safeName = `${demoId}_${index}_${sanitizeFileName(file.name)}${extension}`;
      const filePath = path.join(uploadsDir, safeName);
      const bytes = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, bytes);

      return {
        id: createId("image"),
        url: `/uploads/${safeName}`,
        path: safeName,
        sortOrder: index,
        fileName: file.name
      };
    })
  );

  const demo: Demo = {
    id: demoId,
    creatorId: creatorId ?? null,
    title,
    description,
    shareToken,
    createdAt,
    updatedAt: createdAt,
    images,
    feedback: []
  };

  const db = await readLocalDb();
  db.demos.unshift(demo);
  await writeLocalDb(db);

  return demo;
}

async function addLocalFeedbackByToken(shareToken: string, input: FeedbackInput) {
  const db = await readLocalDb();
  const demo = db.demos.find((item) => item.shareToken === shareToken);

  if (!demo) {
    return false;
  }

  demo.feedback.unshift({
    id: createId("feedback"),
    demoId: demo.id,
    nickname: input.nickname,
    content: input.content,
    deviceType: input.deviceType,
    createdAt: new Date().toISOString()
  });
  demo.updatedAt = new Date().toISOString();
  await writeLocalDb(db);
  return true;
}

async function deleteLocalDemoByToken(shareToken: string, creatorId?: string | null) {
  const db = await readLocalDb();
  const index = db.demos.findIndex(
    (demo) => demo.shareToken === shareToken && (!creatorId || demo.creatorId === creatorId)
  );

  if (index === -1) {
    return false;
  }

  const [removedDemo] = db.demos.splice(index, 1);
  await writeLocalDb(db);

  await Promise.all(
    removedDemo.images.map(async (image) => {
      if (!image.path) {
        return;
      }

      try {
        await unlink(path.join(uploadsDir, image.path));
      } catch {
        // Ignore missing local files during cleanup.
      }
    })
  );

  return true;
}

async function createSupabaseDemo({ creatorId, title, description, imageFiles }: CreateDemoInput) {
  const supabase = getSupabaseAdminClient();
  const createdAt = new Date().toISOString();
  const shareToken = createShareToken();

  const { data: demoRow, error: demoError } = await supabase
    .from("demos")
    .insert({
      creator_id: creatorId ?? null,
      title,
      description,
      share_token: shareToken,
      created_at: createdAt,
      updated_at: createdAt
    })
    .select("id, creator_id, title, description, share_token, created_at, updated_at")
    .single();

  if (demoError || !demoRow) {
    throw new Error(demoError?.message ?? "创建 Demo 失败。");
  }

  const uploadedImages: Array<{
    id: string;
    demo_id: string;
    image_url: string;
    image_path: string;
    sort_order: number;
    file_name: string;
  }> = [];

  for (const [index, file] of imageFiles.entries()) {
    const filePath = `${creatorId ?? "public"}/${demoRow.id}/${index}-${sanitizeFileName(file.name)}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage.from(demoBucket).upload(filePath, bytes, {
      contentType: file.type || "image/png",
      upsert: false
    });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data: publicUrlData } = supabase.storage.from(demoBucket).getPublicUrl(filePath);
    uploadedImages.push({
      id: createId("image"),
      demo_id: demoRow.id,
      image_url: publicUrlData.publicUrl,
      image_path: filePath,
      sort_order: index,
      file_name: file.name
    });
  }

  if (uploadedImages.length > 0) {
    const { error: imageError } = await supabase.from("demo_images").insert(uploadedImages);

    if (imageError) {
      throw new Error(imageError.message);
    }
  }

  const { data: fullDemo, error: fullDemoError } = await supabase
    .from("demos")
    .select(
      "id, creator_id, title, description, share_token, created_at, updated_at, demo_images(id, image_url, image_path, sort_order, file_name), feedback(id, demo_id, nickname, content, device_type, created_at)"
    )
    .eq("id", demoRow.id)
    .single();

  if (fullDemoError || !fullDemo) {
    throw new Error(fullDemoError?.message ?? "读取 Demo 失败。");
  }

  return mapDemoRow(fullDemo as SupabaseDemoRow);
}

async function listSupabaseDemosForCreator(creatorId: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("demos")
    .select(
      "id, creator_id, title, description, share_token, created_at, updated_at, demo_images(id, image_url, image_path, sort_order, file_name), feedback(id, demo_id, nickname, content, device_type, created_at)"
    )
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapDemoRow(row as SupabaseDemoRow));
}

async function getSupabaseDemoByToken(shareToken: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("demos")
    .select(
      "id, creator_id, title, description, share_token, created_at, updated_at, demo_images(id, image_url, image_path, sort_order, file_name), feedback(id, demo_id, nickname, content, device_type, created_at)"
    )
    .eq("share_token", shareToken)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    throw new Error(error.message);
  }

  return mapDemoRow(data as SupabaseDemoRow);
}

async function addSupabaseFeedbackByToken(shareToken: string, input: FeedbackInput) {
  const supabase = getSupabaseAdminClient();
  const { data: demo, error: demoError } = await supabase
    .from("demos")
    .select("id")
    .eq("share_token", shareToken)
    .single();

  if (demoError || !demo) {
    return false;
  }

  const { error } = await supabase.from("feedback").insert({
    id: createId("feedback"),
    demo_id: demo.id,
    nickname: input.nickname || null,
    content: input.content,
    device_type: input.deviceType,
    created_at: new Date().toISOString()
  });

  if (error) {
    throw new Error(error.message);
  }

  await supabase
    .from("demos")
    .update({
      updated_at: new Date().toISOString()
    })
    .eq("id", demo.id);

  return true;
}

async function deleteSupabaseDemoByToken(shareToken: string, creatorId: string) {
  const supabase = getSupabaseAdminClient();
  const { data: demo, error } = await supabase
    .from("demos")
    .select("id, creator_id, demo_images(image_path)")
    .eq("share_token", shareToken)
    .eq("creator_id", creatorId)
    .single();

  if (error || !demo) {
    return false;
  }

  const imagePaths = (demo.demo_images ?? [])
    .map((image) => image.image_path)
    .filter((imagePath): imagePath is string => Boolean(imagePath));

  if (imagePaths.length > 0) {
    await supabase.storage.from(demoBucket).remove(imagePaths);
  }

  const { error: deleteError } = await supabase.from("demos").delete().eq("id", demo.id);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  return true;
}

export async function listDemosForCreator(creatorId?: string | null) {
  if (isSupabaseConfigured()) {
    if (!creatorId) {
      return [];
    }

    return listSupabaseDemosForCreator(creatorId);
  }

  return listLocalDemosForCreator(creatorId);
}

export async function getPublicDemoByToken(shareToken: string) {
  return isSupabaseConfigured() ? getSupabaseDemoByToken(shareToken) : getLocalDemoByToken(shareToken);
}

export async function getAdminDemoByToken(shareToken: string, creatorId?: string | null) {
  const demo = await getPublicDemoByToken(shareToken);

  if (!demo) {
    return null;
  }

  if (creatorId && demo.creatorId && demo.creatorId !== creatorId) {
    return null;
  }

  return demo;
}

export async function createDemoWithImages(input: CreateDemoInput) {
  return isSupabaseConfigured() ? createSupabaseDemo(input) : createLocalDemo(input);
}

export async function addFeedbackByToken(shareToken: string, input: FeedbackInput) {
  return isSupabaseConfigured()
    ? addSupabaseFeedbackByToken(shareToken, input)
    : addLocalFeedbackByToken(shareToken, input);
}

export async function deleteDemoByToken(shareToken: string, creatorId?: string | null) {
  if (isSupabaseConfigured()) {
    if (!creatorId) {
      return false;
    }

    return deleteSupabaseDemoByToken(shareToken, creatorId);
  }

  return deleteLocalDemoByToken(shareToken, creatorId);
}
