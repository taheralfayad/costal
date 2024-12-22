import React, { useState, useEffect, useRef } from "react";

const DatePickerInput = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const daysContainerRef = useRef(null);
    const datepickerContainerRef = useRef(null);

    useEffect(() => {
        if (daysContainerRef.current) {
            renderCalendar();
        }
    }, [currentDate, isCalendarOpen]);

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const daysContainer = daysContainerRef.current;
        daysContainer.innerHTML = "";

        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyDiv = document.createElement("div");
            daysContainer.appendChild(emptyDiv);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayDiv = document.createElement("div");
            dayDiv.className =
                "flex h-[38px] w-[38px] items-center justify-center rounded-[7px] border-[.5px] border-transparent text-dark hover:border-stroke hover:bg-gray-2 sm:h-[46px] sm:w-[47px] mb-2";
            dayDiv.textContent = i;
            dayDiv.addEventListener("click", () => {
                const selectedDateValue = `${month + 1}/${i}/${year}`;
                setSelectedDate(selectedDateValue);
                daysContainer
                    .querySelectorAll("div")
                    .forEach((d) => d.classList.remove("bg-primary", "text-white"));
                dayDiv.classList.add("bg-primary", "text-white", "dark:text-white");
            });
            daysContainer.appendChild(dayDiv);
        }
    };

    const handlePrevMonth = () => {
        setCurrentDate(
            (prevDate) => new Date(prevDate.setMonth(prevDate.getMonth() - 1)),
        );
    };

    const handleNextMonth = () => {
        setCurrentDate(
            (prevDate) => new Date(prevDate.setMonth(prevDate.getMonth() + 1)),
        );
    };

    const handleApply = () => {
        if (selectedDate) {
            setIsCalendarOpen(false);
        }
    };

    const handleCancel = () => {
        setSelectedDate(null);
        setIsCalendarOpen(false);
    };

    const handleToggleCalendar = () => {
        setIsCalendarOpen(!isCalendarOpen);
    };

    const handleClickOutside = (event) => {
        if (
            datepickerContainerRef.current &&
            !datepickerContainerRef.current.contains(event.target) &&
            event.target.id !== "datepicker" &&
            event.target.id !== "toggleDatepicker"
        ) {
            setIsCalendarOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    return (
        <section className="bg-white py-20 ">
            <div className="container">
                <div className="mx-auto w-full max-w-[510px]">
                    <div className="relative mb-3">
                        <input
                            id="datepicker"
                            type="text"
                            placeholder="Pick a date"
                            className="h-12 w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-left text-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={selectedDate || ""}
                            readOnly
                            onClick={handleToggleCalendar}
                        /> 
                    </div>

                    {isCalendarOpen && (
                        <div
                            ref={datepickerContainerRef}
                            id="datepicker-container"
                            className="flex w-full flex-col rounded-xl bg-white p-4 shadow-four sm:p-[30px] "
                        >
                            <div className="flex items-center justify-between pb-4">
                                <button
                                    id="prevMonth"
                                    className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-[7px] border-[.5px] border-stroke bg-gray-2 text-dark hover:border-primary hover:bg-primary hover:text-white sm:h-[46px] sm:w-[46px] "
                                    onClick={handlePrevMonth}
                                >
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="fill-current"
                                    >
                                        <path d="M16.2375 21.4875C16.0125 21.4875 15.7875 21.4125 15.6375 21.225L7.16249 12.6C6.82499 12.2625 6.82499 11.7375 7.16249 11.4L15.6375 2.77498C15.975 2.43748 16.5 2.43748 16.8375 2.77498C17.175 3.11248 17.175 3.63748 16.8375 3.97498L8.96249 12L16.875 20.025C17.2125 20.3625 17.2125 20.8875 16.875 21.225C16.65 21.375 16.4625 21.4875 16.2375 21.4875Z" />
                                    </svg>
                                </button>

                                <span
                                    id="currentMonth"
                                    className="text-xl font-medium capitalize text-dark "
                                >
                                    {currentDate.toLocaleDateString("en-US", {
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </span>

                                <button
                                    id="nextMonth"
                                    className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-[7px] border-[.5px] border-stroke bg-gray-2 text-dark hover:border-primary hover:bg-primary hover:text-white sm:h-[46px] sm:w-[46px] "
                                    onClick={handleNextMonth}
                                >
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="fill-current"
                                    >
                                        <path d="M7.7625 21.4875C7.5375 21.4875 7.35 21.4125 7.1625 21.2625C6.825 20.925 6.825 20.4 7.1625 20.0625L15.0375 12L7.1625 3.97498C6.825 3.63748 6.825 3.11248 7.1625 2.77498C7.5 2.43748 8.025 2.43748 8.3625 2.77498L16.8375 11.4C17.175 11.7375 17.175 12.2625 16.8375 12.6L8.3625 21.225C8.2125 21.375 7.9875 21.4875 7.7625 21.4875Z" />
                                    </svg>
                                </button>
                            </div>
                            <div className="grid grid-cols-7 justify-between text-center pb-2 pt-4 text-sm font-medium capitalize text-body-color sm:text-lg ">
                                <span className="flex h-[38px] w-[38px] items-center justify-center sm:h-[46px] sm:w-[47px]">
                                    Mo
                                </span>

                                <span className="flex h-[38px] w-[38px] items-center justify-center sm:h-[46px] sm:w-[47px]">
                                    Tu
                                </span>

                                <span className="flex h-[38px] w-[38px] items-center justify-center sm:h-[46px] sm:w-[47px]">
                                    We
                                </span>

                                <span className="flex h-[38px] w-[38px] items-center justify-center sm:h-[46px] sm:w-[47px]">
                                    Th
                                </span>

                                <span className="flex h-[38px] w-[38px] items-center justify-center sm:h-[46px] sm:w-[47px]">
                                    Fr
                                </span>

                                <span className="flex h-[38px] w-[38px] items-center justify-center sm:h-[46px] sm:w-[47px]">
                                    Sa
                                </span>

                                <span className="flex h-[38px] w-[38px] items-center justify-center sm:h-[46px] sm:w-[47px]">
                                    Su
                                </span>
                            </div>

                            <div
                                ref={daysContainerRef}
                                id="days-container"
                                className="grid grid-cols-7 text-center text-sm font-medium sm:text-lg"
                            >
                                {/* Days will be rendered here */}
                            </div>

                            <div className="flex items-center space-x-3 pt-4 sm:space-x-5">
                                <button
                                    id="cancelBtn"
                                    className="flex h-[50px] w-full items-center justify-center rounded-md bg-dark text-base font-medium text-white hover:bg-opacity-90"
                                    onClick={handleCancel}
                                >
                                    Remove
                                </button>
                                <button
                                    id="cancelBtn"
                                    className="flex h-[50px] w-full items-center justify-center rounded-md bg-primary text-base font-medium text-white hover:bg-blue-dark"
                                    onClick={handleApply}
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default DatePickerInput;