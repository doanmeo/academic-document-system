import React, { useState, useEffect } from 'react';
import { getMyReports } from '../api/interactionApi';
import { Report, ReportStatus } from '../types/admin';
import { PageResponse } from '../types/document';
import { getErrorMessage } from '../utils/errorMessages';
import { Spinner } from '../components/ui/Spinner';
import { Badge } from '../components/ui/Badge';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

const REPORT_STATUS_CONFIG: Record<ReportStatus, { label: string; color: string }> = {
  PENDING: { label: 'Đang chờ', color: 'yellow' },
  IN_REVIEW: { label: 'Đang xem xét', color: 'blue' },
  RESOLVED: { label: 'Đã giải quyết', color: 'green' },
  REJECTED: { label: 'Bị từ chối', color: 'red' },
};

export function MyReports() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PageResponse<Report> | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await getMyReports({ page, size: 10 });
      setData(res);
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Báo cáo vi phạm của tôi</h1>

        {loading ? <Spinner /> : 
          data?.content.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 font-semibold text-gray-700">Thời gian</th>
                    <th className="p-4 font-semibold text-gray-700">Tài liệu bị báo cáo</th>
                    <th className="p-4 font-semibold text-gray-700">Lý do</th>
                    <th className="p-4 font-semibold text-gray-700">Trạng thái</th>
                    <th className="p-4 font-semibold text-gray-700">Phản hồi từ Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.content.map(report => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="p-4 text-sm">{new Date(report.createdAt).toLocaleString()}</td>
                      <td className="p-4 text-sm font-medium text-blue-600">{report.documentTitle || `Tài liệu #${report.documentId}`}</td>
                      <td className="p-4 text-sm">{report.reasonLabel || report.reasonCode}</td>
                      <td className="p-4">
                        <Badge variant={REPORT_STATUS_CONFIG[report.status]?.color as any}>
                          {REPORT_STATUS_CONFIG[report.status]?.label || report.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{report.handlingNote || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="Bạn chưa có báo cáo vi phạm nào." />
          )
        }
        
        {data && data.totalPages > 1 && (
          <div className="mt-6 flex justify-center">
             <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={setPage} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default MyReports;
