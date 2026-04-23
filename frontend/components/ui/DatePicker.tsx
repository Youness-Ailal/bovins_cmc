"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import Icon from "@/components/ui/Icon";

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

export default function DatePicker({
  value,
  onChange,
  placeholder = "jj/mm/aaaa",
  className = "",
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={`flex h-10 w-full items-center justify-between rounded-[6px] border border-border bg-card px-3 font-inter text-[13px] transition-colors hover:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
          value ? "text-label" : "text-placeholder"
        } ${className}`}
      >
        <span>{value ? format(value, "dd/MM/yyyy") : placeholder}</span>
        <Icon name="calendar" size={14} className="shrink-0 text-placeholder" />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange?.(date);
            setOpen(false);
          }}
          locale={fr}
          captionLayout="dropdown"
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
