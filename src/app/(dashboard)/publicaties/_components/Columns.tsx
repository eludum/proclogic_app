"use client"

import { Badge, BadgeProps } from "@/components/Badge"
import { Button } from "@/components/Button"
import { Checkbox } from "@/components/Checkbox"
import { Publication } from "@/data/publicationSchema"
import { formatters } from "@/lib/utils"
import { ColumnDef, createColumnHelper, Row } from "@tanstack/react-table"
import { format } from "date-fns"
import { Ellipsis } from "lucide-react"
import { DataTableColumnHeader } from "./DataTableColumnHeader"

const columnHelper = createColumnHelper<Publication>()

export const getColumns = ({
  onEditClick,
}: {
  onEditClick: (row: Row<Publication>) => void
}) =>
  [
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected()
              ? true
              : table.getIsSomeRowsSelected()
                ? "indeterminate"
                : false
          }
          onCheckedChange={() => table.toggleAllPageRowsSelected()}
          className="translate-y-0.5"
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onClick={(e) => e.stopPropagation()}
          onCheckedChange={() => row.toggleSelected()}
          className="translate-y-0.5"
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      meta: {
        displayName: "Select",
      },
    }),

    columnHelper.accessor("dispatch_date", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Dispatch Date" />
      ),
      cell: ({ getValue }) => {
        const date = getValue()
        return format(new Date(date), "MMM dd, yyyy 'at' h:mma")
      },
      enableSorting: true,
      enableHiding: false,
      meta: {
        className: "tabular-nums",
        displayName: "Dispatch Date",
      },
    }),
    columnHelper.accessor("is_recommended", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Aanbevolen" />
      ),
      enableSorting: true,
      meta: {
        className: "text-left",
        displayName: "Aanbevolen",
      },
      cell: ({ row }) => {
        const statusValue = row.getValue("is_recommended")
        const status = statusValue ? { label: "Aanbevolen", variant: "success" } : { label: "Niet aanbevolen", variant: "neutral" }
        if (!status) {
          return statusValue // Fallback to displaying the raw status
        }
        return (
          <Badge variant={status.variant as BadgeProps["variant"]}>
            {status.label}
          </Badge>
        )
      },
    }),
    columnHelper.accessor("organisation", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Organisatie" />
      ),
      enableSorting: false,
      meta: {
        className: "text-left",
        displayName: "Organisatie",
      },
      filterFn: "arrIncludesSome",
    }),
    columnHelper.accessor("cpv_code", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="CPV Code" />
      ),
      enableSorting: false,
      meta: {
        className: "text-left",
        displayName: "CPV Code",
      },
    }),
    columnHelper.accessor("publication_value", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Bedrag" />
      ),
      enableSorting: true,
      meta: {
        className: "text-right",
        displayName: "Bedrag",
      },
      cell: ({ getValue }) => {
        return (
          <span className="font-medium">
            {formatters.currency({ number: getValue() })}
          </span>
        )
      },
    }),
    columnHelper.display({
      id: "edit",
      header: "Edit",
      enableSorting: false,
      enableHiding: false,
      meta: {
        className: "text-right",
        displayName: "Edit",
      },
      cell: ({ row }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => onEditClick?.(row)}
            className="group aspect-square p-1.5 hover:border hover:border-gray-300 data-[state=open]:border-gray-300 data-[state=open]:bg-gray-50 hover:dark:border-gray-700 data-[state=open]:dark:border-gray-700 data-[state=open]:dark:bg-gray-900"
          >
            <Ellipsis
              className="size-4 shrink-0 text-gray-500 group-hover:text-gray-700 group-data-[state=open]:text-gray-700 group-hover:dark:text-gray-300 group-data-[state=open]:dark:text-gray-300"
              aria-hidden="true"
            />
          </Button>
        )
      },
    }),
  ] as ColumnDef<Publication>[]
