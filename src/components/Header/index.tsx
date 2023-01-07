import Link from "next/link";
import { ActiveLink } from "../ActiveLink";
import { SignInButton } from "../SignInButton";
import styles from "./styles.module.scss";

export const Header: React.FC = () => (
  <header className={styles.container}>
    <div className={styles.content}>
      <Link href="/">
        <a>
          <img src="/images/logo.svg" alt="ig.news logo" />
        </a>
      </Link>

      <nav>
        <ActiveLink activeClassName={styles.active} href="/">
          <a>Home</a>
        </ActiveLink>

        <ActiveLink activeClassName={styles.active} href="/posts">
          <a>Posts</a>
        </ActiveLink>
      </nav>

      <SignInButton />
    </div>
  </header>
);