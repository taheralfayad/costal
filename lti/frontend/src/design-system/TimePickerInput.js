import React, { useState, useRef, useEffect } from 'react';

const generateHours = () => {
    return Array.from({ length: 12 }, (_, i) =>
        (i + 1).toString().padStart(2, '0')
    );
};

const generateMinutes = (interval) => {
    return Array.from({ length: 60 / interval }, (_, i) =>
        (i * interval).toString().padStart(2, '0')
    );
};

const periods = ['AM', 'PM'];

const TimePickerInput = ({ label = 'input', placeholder = 'Pick a date', value, onChange, id, position }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [selectedHour, setSelectedHour] = useState('00');
    const [selectedMinute, setSelectedMinute] = useState('00');
    const [selectedPeriod, setSelectedPeriod] = useState('AM');
    const [activePicker, setActivePicker] = useState(null);
    const timepickerRef = useRef(null);
    const toggleRef = useRef(null);

    const toggleTimepickerVisibility = (picker) => {
        setActivePicker(activePicker === picker ? null : picker);
    };

    const handleSelection = (value, type) => {
        if (type === 'hour') setSelectedHour(value);
        if (type === 'minute') setSelectedMinute(value);
        if (type === 'period') setSelectedPeriod(value);
        setActivePicker(null);
    };

    const handleClickOutside = (event) => {
        if (
            timepickerRef.current &&
            !timepickerRef.current.contains(event.target)) {
            setActivePicker(null);
            setIsVisible(false);

        }
    };

    useEffect(() => {

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        let time = `${selectedHour}:${selectedMinute} ${selectedPeriod}`
        onChange(time)
    }, [selectedHour, selectedMinute, selectedPeriod])

    return (
        <div className='relative w-64'>
            <label className='block mb-2 text-sm font-medium text-gray-700'>
                {label}
            </label>

            <input
                type='text'
                className='h-12 w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                value={value || `${selectedHour}:${selectedMinute} ${selectedPeriod}`}
                readOnly
                placeholder={placeholder}
                onClick={() => setIsVisible(!isVisible)}
            />

            {isVisible && (
                <div
                    ref={timepickerRef}
                    className='absolute z-50 mt-2 bg-white shadow-lg border rounded-md p-2'
                >
                    <div className='flex gap-2 bg-white'>
                        {/* Hour Selection */}
                        <button
                            className='px-4 py-2 border rounded'
                            onClick={() => toggleTimepickerVisibility('hour')}
                        >
                            {selectedHour || 'HH'}
                        </button>
                        {activePicker === 'hour' && (
                            <div className='absolute top-14 left-4 bg-white shadow-lg border rounded-md p-2 max-h-40 overflow-y-auto'>
                                {generateHours().map((hour) => (
                                    <div
                                        key={hour}
                                        className='cursor-pointer p-1 hover:bg-gray-200 rounded-md'
                                        onClick={() => handleSelection(hour, 'hour')}
                                    >
                                        {hour}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Minute Selection */}
                        <button
                            className='px-4 py-2 border rounded'
                            onClick={() => toggleTimepickerVisibility('minute')}
                        >
                            {selectedMinute}
                        </button>
                        {activePicker === 'minute' && (
                            <div className='absolute left-20 top-14 bg-white shadow-lg border rounded-md p-2 max-h-40 overflow-y-auto'>
                                {generateMinutes(5).map((minute) => (
                                    <div
                                        key={minute}
                                        className='cursor-pointer p-1 hover:bg-gray-200 rounded-md'
                                        onClick={() => handleSelection(minute, 'minute')}
                                    >
                                        {minute}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Period Selection */}
                        <button
                            className='px-4 py-2 border rounded'
                            onClick={() => toggleTimepickerVisibility('period')}
                        >
                            {selectedPeriod}
                        </button>
                        {activePicker === 'period' && (
                            <div className='absolute left-36 top-14 bg-white shadow-lg border rounded-md p-2 max-h-40 overflow-y-auto'>
                                {periods.map((period) => (
                                    <div
                                        key={period}
                                        className='cursor-pointer p-1 hover:bg-gray-200 rounded-md'
                                        onClick={() => handleSelection(period, 'period')}
                                    >
                                        {period}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default TimePickerInput