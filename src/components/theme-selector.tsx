import { Tabs } from "@base-ui/react/tabs";
import { useSelector } from "@tanstack/react-store";
import { MonitorCog, Moon, Sun } from "lucide-react";
import { useEffect } from "react";
import { applyTheme } from "~/theme/helpers";
import { changeTheme, themeStore } from "~/theme/store";

export function ThemeSelector(): React.JSX.Element {
	const theme = useSelector(themeStore, (state) => state.theme);

	useEffect(() => {
		if (theme !== "system") return;

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = () => applyTheme("system");

		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, [theme]);

	return (
		<Tabs.Root
			className="relative inline-flex shadow-sm rounded-full border border-slate-200 bg-slate-100 dark:bg-slate-800 dark:border-slate-700"
			value={theme}
			onValueChange={(value) => changeTheme(value)}
		>
			<Tabs.List className="relative z-0 flex items-center">
				<Tabs.Tab
					className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-slate-500 transition-colors duration-200 ease-in-out hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
					value="system"
					suppressHydrationWarning
				>
					<MonitorCog size="1.125rem" />
				</Tabs.Tab>
				<Tabs.Tab
					className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-slate-500 transition-colors duration-200 ease-in-out hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
					value="light"
					suppressHydrationWarning
				>
					<Sun size="1.125rem" />
				</Tabs.Tab>
				<Tabs.Tab
					className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-slate-500 transition-colors duration-200 ease-in-out hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
					value="dark"
					suppressHydrationWarning
				>
					<Moon size="1.125rem" />
				</Tabs.Tab>
				<Tabs.Indicator className="absolute left-0 -top-px z-[-1] h-[calc(100%+0.125rem)] w-(--active-tab-width) translate-x-(--active-tab-left) rounded-full border border-slate-200 bg-white shadow-sm transition-all duration-200 ease-in-out dark:border-slate-600 dark:bg-slate-700" />
			</Tabs.List>
		</Tabs.Root>
	);
}
