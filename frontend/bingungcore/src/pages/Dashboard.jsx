import React from "react";

const Dashboard = () => {
    return (
        <>
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                <div class="flex justify-between items-center">
                    <div class="border rounded-full px-4 py-2 w-full">
                        <div class="flex items-center justify-between">
                            <p>New Announcement</p>
                            <div className="flex items-center">
                                <span class="text-sm text-gray-500 pr-3">1 minute ago</span>
                                <span class="w-3 h-3 bg-green-500 rounded-full"></span>
                            </div>
                            
                        </div>
                    </div>
                </div>
            
                <div className="grid grid-cols-2 gap-4">
                    {/* 3 kotak dan today's appointments */}
                    <div>
                    <div class="grid grid-cols-3 gap-4 mb-4">
                        <div class="bg-white shadow rounded-md p-4 text-center">
                            <h2 class="text-2xl font-bold">31</h2>
                            <p class="text-gray-600">New Patient</p>
                        </div>
                        <div class="bg-white shadow rounded-md p-4 text-center">
                            <h2 class="text-2xl font-bold">13</h2>
                            <p class="text-gray-600">Doctors</p>
                        </div>
                        <div class="bg-white shadow rounded-md p-4 text-center">
                            <h2 class="text-2xl font-bold">20</h2>
                            <p class="text-gray-600">Rooms Available</p>
                        </div>
                    </div>

                    <div class="col-span-1 bg-white shadow rounded-md p-4 gap-4">
                        <h3 class="font-semibold text-lg mb-4">Today's Appointment</h3>
                        <ul class="divide-y">
                            <li class="py-2 flex justify-between">
                            <div>
                                <p>Sam Strand</p>
                                <p class="text-xs text-gray-500">Time with Dr. Deadman</p>
                            </div>
                                <span class="text-yellow-500">Waiting</span>
                                </li>
                                <li class="py-2 flex justify-between">
                                <div>
                                    <p>Heartman</p>
                                    <p class="text-xs text-gray-500">Time with Dr. Deadman</p>
                                </div>
                                <span class="text-yellow-500">Waiting</span>
                                </li>
                                <li class="py-2 flex justify-between">
                                <div>
                                    <p>Mama</p>
                                    <p class="text-xs text-gray-500">Time with Dr. Deadman</p>
                                </div>
                                <span class="text-green-500">Scheduled</span>
                                </li>
                                <li class="py-2 flex justify-between">
                                <div>
                                    <p>Lockne</p>
                                    <p class="text-xs text-gray-500">Time with Dr. Deadman</p>
                                </div>
                                <span class="text-green-500">Scheduled</span>
                                </li>
                                <li class="py-2 flex justify-between">
                                <div>
                                    <p>Cliff Unger</p>
                                    <p class="text-xs text-gray-500">Time with Dr. Deadman</p>
                                </div>
                                <span class="text-green-500">Scheduled</span>
                                </li>
                                <li class="py-2 flex justify-between">
                                <div>
                                    <p>Lou</p>
                                    <p class="text-xs text-gray-500">Time with Dr. Deadman</p>
                                </div>
                                <span class="text-blue-500">Finished</span>
                                </li>
                            </ul>
                    </div>
                    </div>
                    {/* Graphs */}
                    <div class="">
                        <div class="col-span-1 grid grid-cols-1 gap-4">
                            <div class="bg-blue-600 text-white rounded-md p-4">
                                <h4 class="font-semibold mb-2">Patient per Day</h4>
                                <div class="h-32 flex items-center justify-center text-sm">[Graph Placeholder]</div>
                            </div>
                            <div class="bg-white rounded-md shadow p-4">
                                <h4 class="font-semibold mb-2">Patient per Month</h4>
                                <div class="h-32 flex items-center justify-center text-sm">[Graph Placeholder]</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Dashboard;