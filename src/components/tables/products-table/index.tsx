"use client";

import * as React from "react"; // change 1

import {
	type ColumnDef,
	type SortingState, // change 2
	flexRender,
	getCoreRowModel,
	getSortedRowModel, // change 3
	useReactTable,
} from "@tanstack/react-table";

import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";

interface ProductsTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	caption?: React.ReactNode;
	footer?: React.ReactNode;
}

export function ProductsTable<TData, TValue>(
	props: ProductsTableProps<TData, TValue>,
): React.JSX.Element {
	const { columns, data, caption, footer } = props;

	const [sorting, setSorting] = React.useState<SortingState>([]); // change 4

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),

		//change 5
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		state: {
			sorting,
		},

	});

	return (
		<Table>
			{caption && <TableCaption>{caption}</TableCaption>}
			<TableHeader>
				{table.getHeaderGroups().map((headerGroup) => (
					<TableRow key={headerGroup.id}>
						{headerGroup.headers.map((header) => {
							return (
								<TableHead key={header.id}>
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
								</TableHead>
							);
						})}
					</TableRow>
				))}
			</TableHeader>
			<TableBody>
				{table.getRowModel().rows?.length ? (
					table.getRowModel().rows.map((row) => (
						<TableRow
							key={row.id}
							data-state={row.getIsSelected() && "selected"}
						>
							{row.getVisibleCells().map((cell) => (
								<TableCell key={cell.id}>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</TableCell>
							))}
						</TableRow>
					))
				) : (
					<TableRow>
						<TableCell colSpan={columns.length}>No results.</TableCell>
					</TableRow>
				)}
			</TableBody>
			{footer && <TableFooter>{footer}</TableFooter>}
		</Table>
	);
}

}
