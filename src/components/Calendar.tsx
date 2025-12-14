// Tremor Raw Calendar [v0.0.2]

"use client"

import {
  DayPicker,
  type DayPickerProps,
  type Matcher
} from "react-day-picker"

import { cx, focusRing } from "@/lib/utils"

type CalendarProps = DayPickerProps & {
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  enableYearNavigation?: boolean;
}

const Calendar = ({
  mode = "single",
  weekStartsOn = 1,
  numberOfMonths = 1,
  enableYearNavigation = false,
  disableNavigation,
  locale,
  className,
  classNames,
  ...props
}: CalendarProps) => {
  return (
    <DayPicker
      mode={mode as any}
      weekStartsOn={weekStartsOn}
      numberOfMonths={numberOfMonths}
      locale={locale}
      showOutsideDays={numberOfMonths === 1 ? true : false}
      className={cx(className)}
      classNames={{
        months: "flex space-y-0",
        month: "space-y-4 p-3",
        nav: "gap-1 flex items-center rounded-full size-full justify-between p-4",
        table: "w-full border-collapse space-y-1",
        head_cell:
          "w-9 font-medium text-sm sm:text-xs text-center text-gray-400 dark:text-gray-600 pb-2",
        row: "w-full mt-0.5",
        cell: cx(
          "relative p-0 text-center focus-within:relative",
          "text-gray-900 dark:text-gray-50",
        ),
        day: cx(
          "size-9 rounded-xs text-sm text-gray-900 dark:text-gray-50",
          "hover:bg-gray-200 dark:hover:bg-gray-700",
          focusRing,
        ),
        day_today: "font-semibold",
        day_selected: cx(
          "rounded-xs",
          "aria-selected:bg-blue-500 aria-selected:text-gray-50",
          "dark:aria-selected:bg-blue-500 dark:aria-selected:text-gray-50",
        ),
        day_disabled:
          "text-gray-300! dark:text-gray-700! line-through disabled:hover:bg-transparent",
        day_outside: "text-gray-400 dark:text-gray-600",
        day_range_middle: cx(
          "rounded-none!",
          "aria-selected:bg-gray-100! aria-selected:text-gray-900!",
          "dark:aria-selected:bg-gray-900! dark:aria-selected:text-gray-50!",
        ),
        day_range_start: "rounded-r-none rounded-l!",
        day_range_end: "rounded-l-none rounded-r!",
        day_hidden: "invisible",
        ...classNames,
      }}
      tremor-id="tremor-raw"
      {...(props as any)}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar, type Matcher }
