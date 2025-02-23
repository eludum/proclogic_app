"use client"

import { Badge, BadgeProps } from "@/components/Badge"
import { Button } from "@/components/Button"
import { Checkbox } from "@/components/Checkbox"
import { Publication } from "@/data/publicationSchema"
import { cx, formatters } from "@/lib/utils"
import { ColumnDef, createColumnHelper, Row } from "@tanstack/react-table"
import { format } from "date-fns"
import { Ellipsis } from "lucide-react"
import { DataTableColumnHeader } from "./DataTableColumnHeader"

const columnHelper = createColumnHelper<Publication>()

export const getColumns = ({
  onEditClick,
}: {
  onEditClick: (row: Row<Publication>, event: React.MouseEvent) => void
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
    columnHelper.accessor("title", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      enableSorting: false,
      meta: {
        className: "text-left",
        displayName: "`Title`",
      },
      cell: ({ getValue }) => {
        const title = getValue()
        return (
          <div
            title={title}
            className={cx(
              "break-words whitespace-normal"
            )}
            style={{ maxWidth: "75ch" }}
          >
            {title}
          </div>
        )
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
    columnHelper.accessor("publication_value", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Win probabiliteit" />
      ),
      enableSorting: false,
      meta: {
        className: "text-left",
        displayName: "Win probabiliteit",
      },
      cell: ({ getValue }) => {
        const value = getValue()

        function Indicator({ number }: { number: number }) {
          let category
          if (number === 0) {
            category = "zero"
          } else if (number < 9) {
            category = "bad"
          } else if (number >= 9 && number <= 15) {
            category = "ok"
          } else {
            category = "good"
          }

          const getBarClass = (index: number) => {
            if (category === "zero") {
              return "bg-gray-300 dark:bg-gray-800"
            } else if (category === "good") {
              return "bg-indigo-600 dark:bg-indigo-500"
            } else if (category === "ok" && index < 2) {
              return "bg-indigo-600 dark:bg-indigo-500"
            } else if (category === "bad" && index < 1) {
              return "bg-indigo-600 dark:bg-indigo-500"
            }
            return "bg-gray-300 dark:bg-gray-800"
          }

          return (
            <div className="flex gap-0.5">
              <div className={`h-3.5 w-1 rounded-sm ${getBarClass(0)}`} />
              <div className={`h-3.5 w-1 rounded-sm ${getBarClass(1)}`} />
              <div className={`h-3.5 w-1 rounded-sm ${getBarClass(2)}`} />
            </div>
          )
        }

        return (
          <div className="flex items-center gap-0.5">
            <span className="w-6">{value}</span>
            <Indicator number={Number(value) || 0} />
          </div>
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
    columnHelper.accessor("sector", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sector" />
      ),
      enableSorting: false,
      meta: {
        className: "text-left",
        displayName: "Sector",
      },
    }),
    columnHelper.accessor("publication_value", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Geraamd bedrag" />
      ),
      enableSorting: true,
      meta: {
        className: "text-right",
        displayName: "Geraamd bedrag",
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
            onClick={(event) => onEditClick?.(row, event)}
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