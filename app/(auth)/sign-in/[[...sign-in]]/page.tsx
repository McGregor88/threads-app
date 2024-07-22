// Catch-all Segments can be made optional by including the parameter in double square brackets: [[...folderName]].
// The difference between catch-all and optional catch-all segments is that with optional, 
// the route without the parameter is also matched (/shop in the example above).

import { SignIn } from "@clerk/nextjs";
 
export default function Page() {
    return <SignIn />;
}