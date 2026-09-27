import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, useRouter } = createNavigation(routing); // @if auth
// export const { Link } = createNavigation(routing); // @if !auth
