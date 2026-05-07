/// <reference types="vite/client" />
import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import tailwindcss from "~/theme/globals.css?url";
import { ThemeProvider } from "~/theme/provider";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				name: "color-scheme",
				content: "light dark",
			},
			{
				name: "theme-color",
				content: "#ffffff",
			},
			{
				title: "TanStack Start Starter",
			},
		],
		links: [{ rel: "stylesheet", href: tailwindcss }],
	}),
	component: RootComponent,
});

function RootComponent() {
	return (
		<RootDocument>
			<Outlet />
		</RootDocument>
	);
}

interface RootDocumentProps {
	children: React.ReactNode;
}

function RootDocument(props: Readonly<RootDocumentProps>) {
	const { children } = props;

	return (
		<html lang="en" dir="ltr" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body className="antialiased bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
				<ThemeProvider>
					{children}
					<Scripts />
				</ThemeProvider>
			</body>
		</html>
	);
}
