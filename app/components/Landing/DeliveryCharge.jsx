import React, { useState, useEffect } from 'react';
import { FiMapPin, FiTruck, FiClock, FiDollarSign, FiInfo } from 'react-icons/fi';

const DeliveryCharge = ({ handleDeliveryChange, deliveryArea, setSelectedDeliveryCharge }) => {
    const [selectedArea, setSelectedArea] = useState(null);

    // Ensure deliveryArea is always an array
    const areas = Array.isArray(deliveryArea) ? deliveryArea : [];

    // ডিফল্ট হিসেবে প্রথম এলাকা সিলেক্ট করুন
    useEffect(() => {
        if (areas.length > 0 && !selectedArea) {
            const firstArea = areas[0];
            setSelectedArea(firstArea);
            setSelectedDeliveryCharge(firstArea.delivery_charge);
            // Second arg (full area) is opt-in — old callers that take only the
            // charge ignore it; new callers can use it to also update district name,
            // estimated days, delivery note, etc.
            handleDeliveryChange(firstArea.delivery_charge, firstArea);
        }
    }, [areas]);

    // এলাকা সিলেক্ট করার হ্যান্ডলার
    const handleAreaSelect = (area) => {
        setSelectedArea(area);
        setSelectedDeliveryCharge(area.delivery_charge);
        handleDeliveryChange(area.delivery_charge, area);
    };

    return (
        <div className="mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <label className="flex items-center text-lg font-semibold mb-4 text-gray-800">
                    <FiMapPin className="mr-2 text-green-600" />
                    ডেলিভারি এলাকা
                </label>

                {/* Loading state */}
                {areas.length === 0 && (
                    <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mr-3"></div>
                        <span className="text-gray-600">ডেলিভারি এলাকার তথ্য লোড হচ্ছে...</span>
                    </div>
                )}

                {/* District options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    {areas.map((area) => (
                        <div 
                            key={area.id}
                            onClick={() => handleAreaSelect(area)}
                            className={`cursor-pointer transition-all duration-200 ${selectedArea?.id === area.id ? 'ring-2 ring-green-500 ring-opacity-50' : ''}`}
                        >
                            <div className={`p-3 rounded-lg border ${selectedArea?.id === area.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300 hover:bg-green-50'}`}>
                                <div className="flex items-start">
                                    <input
                                        type="radio"
                                        id={`district-${area.id}`}
                                        name="deliveryDistrict"
                                        value={area.district_name}
                                        checked={selectedArea?.id === area.id}
                                        onChange={() => {}}
                                        className="mt-1 mr-3 text-green-600 focus:ring-green-500 cursor-pointer"
                                    />
                                    <div className="flex-1">
                                        <label 
                                            htmlFor={`district-${area.id}`}
                                            className="block font-medium text-gray-800 cursor-pointer"
                                        >
                                            {area.district_name}
                                            {/* {selectedArea?.id === area.id && (
                                                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                                    নির্বাচিত
                                                </span>
                                            )} */}
                                        </label>
                                        <div className="mt-2 flex flex-wrap gap-3 text-sm">
                                            <div className="flex items-center text-gray-600">
                                                <FiTruck className="mr-1.5 text-green-500" />
                                                <span>
                                                    {area.delivery_charge === 0 
                                                        ? 'ফ্রি ডেলিভারি' 
                                                        : `${area.delivery_charge} টাকা`}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <FiClock className="mr-1.5 text-green-500" />
                                                <span>{area.estimated_days} কার্যদিবস</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Selected delivery info */}
                {/* {selectedArea && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="font-medium text-blue-800">
                                    {selectedArea.district_name}
                                </span>
                                <div className="text-sm text-blue-600">
                                    ডেলিভারি চার্জ: {selectedArea.delivery_charge === 0 ? 'ফ্রি' : `${selectedArea.delivery_charge} টাকা`}
                                    {selectedArea.estimated_days && (
                                        <span className="ml-3">
                                            • সময়: {selectedArea.estimated_days} কার্যদিবস
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )} */}

                {/* Help text */}
                {areas.length === 0 && (
                    <p className="mt-3 text-sm text-gray-500 flex items-center">
                        <FiInfo className="mr-1.5 text-blue-500" />
                        আপনার এলাকা সিলেক্ট করে ডেলিভারি চার্জ ও সময় দেখুন
                    </p>
                )}
            </div>
        </div>
    );
};

export default DeliveryCharge;