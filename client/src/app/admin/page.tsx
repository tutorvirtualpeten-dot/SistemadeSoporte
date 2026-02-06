'use client';

import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import {
    BarChart3,
    Clock,
    CheckCircle,
    AlertCircle,
    Download,
    Calendar,
    Filter
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

interface DashboardData {
    summary: {
        totalTickets: number;
        pendientes: number;
        enProceso: number;
        resueltos: number;
    };
    charts: {
        byStatus: { _id: string; count: number }[];
        byPriority: { _id: string; count: number }[];
        byUserType: { _id: string; count: number }[];
        dailyTrend: { _id: string; count: number }[];
    };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AdminDashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd')
    });
    // Default: mostrar solo abiertos y en proceso
    const [statusFilter, setStatusFilter] = useState<string[]>(['abierto', 'en_progreso']);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const statusQuery = statusFilter.join(',');
            const res = await api.get(`/admin/stats?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&status=${statusQuery}`);
            setData(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [statusFilter]);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateRange({ ...dateRange, [e.target.name]: e.target.value });
    };

    const applyFilter = () => {
        fetchStats();
    };

    const exportToExcel = () => {
        if (!data) return;
        const wb = XLSX.utils.book_new();

        // Hoja Resumen
        const summaryData = [
            { Metrica: 'Total Tickets', Valor: data.summary.totalTickets },
            { Metrica: 'Pendientes', Valor: data.summary.pendientes },
            { Metrica: 'En Proceso', Valor: data.summary.enProceso },
            { Metrica: 'Resueltos', Valor: data.summary.resueltos },
        ];
        const wsSummary = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen");

        // Hoja Tipo Usuario
        const userTypeData = data.charts.byUserType.map(item => ({ Tipo: item._id, Cantidad: item.count }));
        const wsUserType = XLSX.utils.json_to_sheet(userTypeData);
        XLSX.utils.book_append_sheet(wb, wsUserType, "TipoUsuario");

        XLSX.writeFile(wb, `Reporte_Soporte_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    };

    const exportToPDF = () => {
        if (!data) return;
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text("Reporte de Soporte Técnico", 14, 22);

        doc.setFontSize(11);
        doc.text(`Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);
        doc.text(`Rango: ${dateRange.startDate} a ${dateRange.endDate}`, 14, 36);

        // Resumen Table
        const summaryBody = [
            ['Total Tickets', data.summary.totalTickets.toString()],
            ['Pendientes', data.summary.pendientes.toString()],
            ['En Proceso', data.summary.enProceso.toString()],
            ['Resueltos', data.summary.resueltos.toString()],
        ];

        (doc as any).autoTable({
            startY: 45,
            head: [['Métrica', 'Valor']],
            body: summaryBody,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] } // Blue
        });

        // User Type Table
        const userTypeBody = data.charts.byUserType.map(item => [item._id || 'Desconocido', item.count.toString()]);

        (doc as any).autoTable({
            startY: (doc as any).lastAutoTable.finalY + 15,
            head: [['Tipo de Usuario', 'Tickets']],
            body: userTypeBody,
            theme: 'striped'
        });

        doc.save(`Reporte_Soporte_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    };

    if (loading && !data) return <div className="p-8 text-center text-gray-500">Cargando dashboard...</div>;
    if (!data) return <div className="p-8 text-center text-red-500">Error al cargar datos</div>;

    const cards = [
        { name: 'Total Tickets', value: data.summary.totalTickets, icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-100' },
        { name: 'Pendientes', value: data.summary.pendientes, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
        { name: 'En Proceso', value: data.summary.enProceso, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
        { name: 'Resueltos', value: data.summary.resueltos, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard de Administración</h1>

                <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow text-sm ml-auto">
                    <label className="flex items-center gap-1 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={statusFilter.includes('abierto') && statusFilter.includes('en_progreso') && !statusFilter.includes('resuelto')}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setStatusFilter(['abierto', 'en_progreso']); // Solo activos
                                } else {
                                    setStatusFilter(['abierto', 'en_progreso', 'resuelto', 'cerrado']); // Todos
                                }
                            }}
                            className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">Solo Pendientes/Proceso</span>
                    </label>
                </div>

                <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-lg shadow text-sm">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <input
                            type="date"
                            name="startDate"
                            value={dateRange.startDate}
                            onChange={handleDateChange}
                            className="border-none focus:ring-0 text-gray-600 p-0 text-sm"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="date"
                            name="endDate"
                            value={dateRange.endDate}
                            onChange={handleDateChange}
                            className="border-none focus:ring-0 text-gray-600 p-0 text-sm"
                        />
                    </div>
                    <button
                        onClick={applyFilter}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-md transition-colors"
                        title="Aplicar Filtros"
                    >
                        <Filter className="h-4 w-4" />
                    </button>
                    <div className="h-4 w-px bg-gray-300 mx-1"></div>
                    <button onClick={exportToExcel} className="flex items-center gap-1 text-green-700 hover:text-green-800 px-2 py-1 rounded hover:bg-green-50">
                        <Download className="h-4 w-4" /> Excel
                    </button>
                    <button onClick={exportToPDF} className="flex items-center gap-1 text-red-700 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50">
                        <Download className="h-4 w-4" /> PDF
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => (
                    <div key={card.name} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className={`flex-shrink-0 rounded-md p-3 ${card.bg}`}>
                                    <card.icon className={`h-6 w-6 ${card.color}`} aria-hidden="true" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">{card.name}</dt>
                                        <dd className="text-2xl font-semibold text-gray-900">{card.value}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Tickets by User Type - Bar Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Tickets por Tipo de Usuario</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.charts.byUserType}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="_id" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#3b82f6" name="Tickets" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Tickets by Status - Pie Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Distribución por Estado</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.charts.byStatus}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                    nameKey="_id"
                                >
                                    {data.charts.byStatus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Tickets by Priority - Bar Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Tickets por Prioridad</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.charts.byPriority} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="_id" type="category" width={80} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#f59e0b" name="Tickets" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Daily Trend - Line Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Tendencia Diaria (Últimos 30 días)</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.charts.dailyTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="_id" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} name="Tickets" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div >
    );
}
