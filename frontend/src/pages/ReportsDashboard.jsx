import { useEffect, useState } from 'react';
import api from '../api/axios';

const ReportsDashboard = () => {
    const [participationStats, setParticipationStats] = useState([]);
    const [attendanceStats, setAttendanceStats] = useState([]);
    const [departmentStats, setDepartmentStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const [participationRes, attendanceRes, departmentRes] = await Promise.all([
                    api.get('/reports/event-summary'),
                    api.get('/reports/attendance-summary'),
                    api.get('/reports/department-summary')
                ]);

                setParticipationStats(participationRes.data);
                setAttendanceStats(attendanceRes.data);
                setDepartmentStats(departmentRes.data);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch report data');
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    if (loading) return <div className="text-white text-center mt-10">Loading reports...</div>;
    if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <h1 className="text-3xl font-bold text-blue-400 mb-8">Reports & Analytics</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Event Participation Stats */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-600 pb-2">
                        <h2 className="text-xl font-bold text-white">Event Participation</h2>
                        <div className="flex gap-2">
                            <button onClick={() => window.open('http://localhost:5000/api/reports/export?type=participation&format=pdf')} className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded">PDF</button>
                            <button onClick={() => window.open('http://localhost:5000/api/reports/export?type=participation&format=excel')} className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded">Excel</button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-gray-300">
                            <thead className="text-xs uppercase bg-gray-700 text-gray-400">
                                <tr>
                                    <th className="py-2 px-4">Event Name</th>
                                    <th className="py-2 px-4 text-right">Registrations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {participationStats.map((stat, index) => (
                                    <tr key={index} className="hover:bg-gray-750">
                                        <td className="py-3 px-4 font-medium">{stat.label}</td>
                                        <td className="py-3 px-4 text-right font-bold text-blue-400">{stat.value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {participationStats.length === 0 && <p className="text-center text-gray-500 mt-4">No data available</p>}
                    </div>
                </div>

                {/* Department Distribution */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-600 pb-2">
                        <h2 className="text-xl font-bold text-white">Department Participation</h2>
                        <div className="flex gap-2">
                            <button onClick={() => window.open('http://localhost:5000/api/reports/export?type=department&format=pdf')} className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded">PDF</button>
                            <button onClick={() => window.open('http://localhost:5000/api/reports/export?type=department&format=excel')} className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded">Excel</button>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {departmentStats.map((stat, index) => (
                            <div key={index}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-300">{stat.label}</span>
                                    <span className="font-bold text-green-400">{stat.value} Students</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2.5">
                                    <div
                                        className="bg-green-600 h-2.5 rounded-full"
                                        style={{ width: `${(stat.value / Math.max(...departmentStats.map(s => s.value))) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                        {departmentStats.length === 0 && <p className="text-center text-gray-500 mt-4">No data available</p>}
                    </div>
                </div>

                {/* Attendance Health (Full Width) */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 lg:col-span-2">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-600 pb-2">
                        <h2 className="text-xl font-bold text-white">Attendance Health (Present vs Registered)</h2>
                        <div className="flex gap-2">
                            <button onClick={() => window.open('http://localhost:5000/api/reports/export?type=attendance&format=pdf')} className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded">PDF</button>
                            <button onClick={() => window.open('http://localhost:5000/api/reports/export?type=attendance&format=excel')} className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded">Excel</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {attendanceStats.map((stat, index) => (
                            <div key={index} className="bg-gray-900 p-4 rounded border border-gray-800">
                                <h3 className="text-lg font-semibold text-gray-200 mb-2 truncate">{stat.label}</h3>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-400 text-sm">Attendance Rate</span>
                                    <span className={`text-xl font-bold ${stat.percentage >= 75 ? 'text-green-500' :
                                        stat.percentage >= 50 ? 'text-yellow-500' : 'text-red-500'
                                        }`}>
                                        {stat.percentage}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                                    <div
                                        className={`h-2 rounded-full ${stat.percentage >= 75 ? 'bg-green-600' :
                                            stat.percentage >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                                            }`}
                                        style={{ width: `${stat.percentage}%` }}
                                    ></div>
                                </div>
                                <div className="text-xs text-gray-500 flex justify-between">
                                    <span>Registered: {stat.registered}</span>
                                    <span>Present: {stat.present}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    {attendanceStats.length === 0 && <p className="text-center text-gray-500 mt-4">No data available</p>}
                </div>
            </div>
        </div>
    );
};

export default ReportsDashboard;
