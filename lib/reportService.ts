import api from './api'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DashboardOverview {
  summary: {
    total_reports: number
    total_messages_30d: number
    pass_rate_30d: number
    failed_messages_30d: number
    suspicious_ips_30d: number
    unread_alerts: number
  }
  domains: { id: number; domain_name: string; is_verified: boolean }[]
  geo_data: GeoData[]
  recent_reports: DMARCReport[]
}

export interface DMARCReport {
  id: string
  org_name: string
  org_email: string
  domain_policy: string
  domain_name: string
  date_begin: string
  date_end: string
  policy_p: string
  total_messages: number
  passed_messages: number
  failed_messages: number
  pass_rate: number
  status: 'pending' | 'parsed' | 'error'
  created_at: string
  parsed_at: string
}

export interface DMARCRecord {
  id: number
  source_ip: string
  message_count: number
  disposition: string
  dkim_result: string
  spf_result: string
  header_from: string
  geo_country: string
  geo_city: string
  geo_latitude: number | null
  geo_longitude: number | null
  geo_isp: string
  is_suspicious: boolean
  is_fully_passing: boolean
  created_at: string
}

export interface GeoData {
  source_ip: string
  geo_country: string
  geo_city: string
  geo_latitude: number
  geo_longitude: number
  is_suspicious: boolean
  spf_result: string
  dkim_result: string
  total: number
}

export interface ReportStats {
  period_days: number
  total_reports: number
  total_messages: number
  passed_messages: number
  failed_messages: number
  pass_rate: number
  suspicious_ips: number
  top_failing_ips: { source_ip: string; geo_country: string; count: number }[]
  reports_by_day: { day: string; total: number; messages: number; failed: number }[]
}

export interface AlertLog {
  id: number
  alert_type: string
  channel: string
  recipient: string
  subject: string
  status: string
  is_read: boolean
  source_ip: string
  domain: string
  sent_at: string
  created_at: string
}

// ── API Calls ─────────────────────────────────────────────────────────────────

// Dashboard
export const getDashboardOverview = () =>
  api.get<DashboardOverview>('/dashboard/overview/').then((r) => r.data)

// Reports
export const getReports = (params?: {
  domain_id?: number
  status?: string
  date_from?: string
  date_to?: string
  page?: number
  page_size?: number
}) => api.get('/reports/', { params }).then((r) => r.data)

export const getReportDetail = (id: string) =>
  api.get(`/reports/${id}/`).then((r) => r.data)

export const getReportStats = (days = 30) =>
  api.get<ReportStats>('/reports/stats/', { params: { days } }).then((r) => r.data)

export const uploadReport = (file: File, domain_id?: number) => {
  const form = new FormData()
  form.append('file', file)
  if (domain_id) form.append('domain_id', String(domain_id))
  return api.post('/reports/upload/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data)
}

export const fetchEmailNow = () =>
  api.post('/reports/fetch-email/').then((r) => r.data)

export const getTaskStatus = (taskId: string) =>
  api.get(`/tasks/${taskId}/status/`).then((r) => r.data)

// Records
export const getRecords = (params?: {
  report_id?: string
  source_ip?: string
  is_suspicious?: boolean
  spf_result?: string
  dkim_result?: string
  page?: number
}) => api.get('/records/', { params }).then((r) => r.data)

// Domains
export const getDomains = () =>
  api.get('/domains/').then((r) => r.data)

export const addDomain = (data: { domain_name: string; rua_email: string }) =>
  api.post('/domains/', data).then((r) => r.data)

export const deleteDomain = (id: number) =>
  api.delete(`/domains/${id}/`).then((r) => r.data)

// Alerts
export const getAlerts = (is_read?: boolean) =>
  api.get<{ count: number; unread: number; results: AlertLog[] }>(
    '/alerts/',
    { params: is_read !== undefined ? { is_read } : {} }
  ).then((r) => r.data)

export const markAlertRead = (id: number) =>
  api.post(`/alerts/${id}/read/`).then((r) => r.data)

// IMAP Config
export const getIMAPConfig = () =>
  api.get('/imap/config/').then((r) => r.data)

export const saveIMAPConfig = (data: {
  host: string; port: number; username: string
  password: string; use_ssl: boolean; mailbox: string
}) => api.post('/imap/config/', data).then((r) => r.data)

export async function deleteReport(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/${id}/`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })

  if (!res.ok) {
    throw new Error('Gagal menghapus report')
  }

  return true
}