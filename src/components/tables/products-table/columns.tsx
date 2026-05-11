import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react"; 

export interface Product {
	id: string;
	name: string;
	brandId: string;
	brand: string;
	categoryId: string;
	category: string;
	price: number;
	currency: string;
	stock: number;
	status: "active" | "hidden" | "disabled";
	lastUpdated: string;
}

export const products: Product[] = [
	{
		id: "prod-001",
		name: "Grass-Fed Bio Ribeye Steak",
		brandId: "br-001",
		brand: "Nature's Pasture",
		categoryId: "cat-001",
		category: "Bio Meat",
		price: 34.5,
		currency: "USD",
		stock: 15,
		status: "active",
		lastUpdated: "2026-04-30T08:00:00Z",
	},
	{
		id: "prod-002",
		name: "Zero-Proof Botanical Spirit",
		brandId: "br-002",
		brand: "Clear Mind Beverage Co.",
		categoryId: "cat-002",
		category: "Beverages",
		price: 28.0,
		currency: "USD",
		stock: 45,
		status: "active",
		lastUpdated: "2026-05-01T10:30:00Z",
	},
	{
		id: "prod-003",
		name: "Organic Free-Range Whole Chicken",
		brandId: "br-003",
		brand: "Heritage Farms",
		categoryId: "cat-001",
		category: "Bio Meat",
		price: 22.9,
		currency: "USD",
		stock: 4,
		status: "active",
		lastUpdated: "2026-05-01T11:15:00Z",
	},
	{
		id: "prod-004",
		name: "Sparkling Mineral Water (12-Pack)",
		brandId: "br-004",
		brand: "Alpine Springs",
		categoryId: "cat-002",
		category: "Beverages",
		price: 14.99,
		currency: "USD",
		stock: 120,
		status: "active",
		lastUpdated: "2026-04-29T16:45:00Z",
	},
	{
		id: "prod-005",
		name: "Pasture-Raised Bio Lamb Chops",
		brandId: "br-001",
		brand: "Nature's Pasture",
		categoryId: "cat-001",
		category: "Bio Meat",
		price: 42.0,
		currency: "USD",
		stock: 0,
		status: "disabled",
		lastUpdated: "2026-05-01T09:00:00Z",
	},
];



const SortableHeader = ({ column, title }: { column: any; title: string }) => (
	<div
		className="flex items-center gap-2 cursor-pointer select-none font-bold"
		onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
	>
		{title}
		<ArrowUpDown className="h-4 w-4" />
	</div>
);


export const columns: ColumnDef<Product>[] = [
	{
		accessorKey: "id",
		header: ({ column }) => <SortableHeader column = {column} title = "ID"/>,
	},
	{
		accessorKey: "name",
		header: ({ column }) => <SortableHeader column = {column} title = "Product Name"/>,
		cell: ({ row }) => {
			const id = row.original.id;
			const name = row.getValue("name") as string;

			return (
				<a href={`/product/${id}`} className="text-blue-600 hover:underline">
					{name}
				</a>
			);
		},
	},
	{
		accessorKey: "brand",
		header: ({ column }) => <SortableHeader column = {column} title = "Brand"/>,
		cell: ({ row }) => {
			const brandId = row.original.brandId;
			const brand = row.getValue("brand") as string;

			return (
				<Link to="/brands/$brandId" params={{ brandId: brandId }}>
					{brand}
				</Link>
			);
		},
	},
	{
		accessorKey: "category",
		header: ({ column }) => <SortableHeader column = {column} title = "Category"/>,
		cell: ({ row }) => {
			const categoryId = row.original.categoryId;
			const category = row.getValue("category") as string;

			return (
				<Link to="/categories/$categoryId" params={{ categoryId: categoryId }}>
					{category}
				</Link>
			);
		},
	},
	{
		accessorKey: "price",
		header: ({ column }) => <SortableHeader column = {column} title = "Price"/>,
		cell: ({ row }) => {
			const amount = parseFloat(row.getValue("price"));
			const currency = row.original.currency;

			const formatted = new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: currency,
			}).format(amount);

			return formatted;
		},
	},
	{
		accessorKey: "stock",
		header: ({ column }) => <SortableHeader column = {column} title = "Stock Level"/>,
		cell: ({ row }) => {
			const stock = row.getValue("stock") as number;
			return stock > 5 ? stock : `${stock} (Low Stock)`;
		},
	},
	{
		accessorKey: "status",
		header: ({ column }) => <SortableHeader column = {column} title = "Status"/>,
		cell: ({ row }) => {
			const status = row.getValue("status") as string;
			return status.charAt(0).toUpperCase() + status.slice(1);
		},
	},
	{
		accessorKey: "lastUpdated",
		header: ({ column }) => <SortableHeader column = {column} title = "Last Updated"/>,
		cell: ({ row }) => {
			const date = new Date(row.getValue("lastUpdated"));
			return date.toLocaleDateString("en-US", {
				year: "numeric",
				month: "short",
				day: "numeric",
			});
		},
	},
];
