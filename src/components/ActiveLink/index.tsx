import Link, { LinkProps } from "next/link";
import { useRouter } from "next/router";
import { cloneElement, ReactElement } from "react";

interface ActiveLinkProps extends LinkProps {
  children: ReactElement;
  activeClassName: string;
}

export const ActiveLink: React.FC<ActiveLinkProps> = ({
  children,
  activeClassName,
  ...props
}) => {
  const { asPath } = useRouter();

  return (
    <Link {...props}>
      {cloneElement(children, {
        className: asPath === props.href ? activeClassName : undefined,
      })}
    </Link>
  );
};