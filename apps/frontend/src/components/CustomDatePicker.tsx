import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { offset } from '@floating-ui/dom';

interface CustomDatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholderText?: string;
  className?: string;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  selected,
  onChange,
  placeholderText = "Select date",
  className = "",
  required = false,
  minDate,
  maxDate,
}) => {
  return (
    <div className="relative">
      <DatePicker
        selected={selected}
        onChange={onChange}
        placeholderText={placeholderText}
        required={required}
        minDate={minDate}
        maxDate={maxDate}
        className={`w-full rounded-md border border-input px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent ${className}`}
        calendarClassName="bg-background border border-border rounded-md shadow-lg"
        dayClassName={(date) =>
          "hover:bg-accent hover:text-accent-foreground rounded-md p-2 text-sm"
        }
        monthClassName={() => "text-foreground"}
        yearClassName={() => "text-foreground"}
        weekDayClassName={() => "text-muted-foreground font-medium"}
        popperModifiers={[
          offset({
            mainAxis: 8,
          }),
        ]}
      />
    </div>
  );
};