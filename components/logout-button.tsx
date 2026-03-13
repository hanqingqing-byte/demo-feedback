export function LogoutButton() {
  return (
    <form action="/auth/sign-out" method="post">
      <button className="buttonSecondary" type="submit">
        退出登录
      </button>
    </form>
  );
}
