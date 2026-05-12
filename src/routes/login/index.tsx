import { useState } from "react"; // 1. Import useState to track if the password is shown or hidden
import { Eye, EyeOff } from "lucide-react"; // 2. Import eye icons from lucide-react
import { Field } from "@base-ui/react/field";
import { Form } from "@base-ui/react/form";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";

export const Route = createFileRoute("/login/")({
  component: LoginPage,
});

function LoginPage(): React.JSX.Element {
  // 3. Define visibility state inside the component
  const [isVisible, setIsVisible] = useState(false);

  return (
    <main className="grid min-h-screen grid-cols-1 md:grid-cols-2 bg-slate-50 dark:bg-slate-950">
      <section className="grid place-items-center bg-white p-8 dark:bg-slate-900">
        <article className="grid w-full max-w-sm gap-8">
          <header className="grid gap-2 text-center">
            <h1 className="m-0 text-2xl font-bold text-slate-950 dark:text-slate-50">
              Admin Portal
            </h1>
            <p className="m-0 text-sm text-slate-600 dark:text-slate-400">
              Sign up to access the administrative dashboard.
            </p>
          </header>

          <Form className="grid gap-y-4">
            <Field.Root className="grid gap-2">
              <Field.Label className="text-[13px] text-slate-600 dark:text-slate-400">
                E-mail address
              </Field.Label>
              <Field.Control
                required
                type="email"
                placeholder="Required"
                className="h-10 rounded-md border border-slate-200 bg-slate-50 px-4 text-slate-900 transition-all focus-within:outline-none focus-within:ring-2 focus-within:ring-slate-400 focus-within:ring-offset-2 data-invalid:border-red-500 data-invalid:focus-within:ring-red-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:focus-within:ring-slate-600 dark:focus-within:ring-offset-slate-900 dark:data-invalid:border-red-500 dark:data-invalid:focus-within:ring-red-400"
              />
              <Field.Error
                className="text-sm text-red-500 dark:text-red-400"
                match="valueMissing"
              >
                Please enter your email
              </Field.Error>
            </Field.Root>

            <Field.Root className="grid gap-2">
              <Field.Label className="text-[13px] text-slate-600 dark:text-slate-400">
                Password
              </Field.Label>
              
              {/* 4. Wrap the input and button in a relative div for positioning */}
              <div className="relative">
                <Field.Control
                  required
                  // 5. Dynamically switch type between 'text' and 'password'
                  type={isVisible ? "text" : "password"}
                  placeholder="Required"
                  className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-4 pr-10 text-slate-900 transition-all focus-within:outline-none focus-within:ring-2 focus-within:ring-slate-400 focus-within:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
                />
                
                {/* 6. Add a button positioned absolutely inside the input field */}
                <button
                  type="button" // 7. Ensure type is 'button' to prevent form submission
                  onClick={() => setIsVisible(!isVisible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
                  aria-label={isVisible ? "Hide password" : "Show password"} // 8. Add accessibility labels
                >
                  {/* 9. Conditionally render the icon based on visibility state */}
                  {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <Field.Error
                className="text-sm text-red-500 dark:text-red-400"
                match="valueMissing"
              >
                Please enter your password
              </Field.Error>
            </Field.Root>

            <Button type="submit" className="w-full">
              Login
            </Button>
          </Form>
        </article>
      </section>
    </main>
  );
}
