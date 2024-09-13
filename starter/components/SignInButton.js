import { siginInAction } from "../../app/_lib/actions";

function SignInButton() {
  return (
    <form action={siginInAction}>
      <button className="flex items-center gap-6 text-lg border border-primary-300 px-10 py-4 font-medium">
        <img
          src="https://authjs.dev/img/providers/github.svg"
          alt="Google logo"
          height="24"
          width="24"
        />
        <span>Continue with Github</span>
      </button>
    </form>
  );
}

export default SignInButton;
