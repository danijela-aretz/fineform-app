<script setup>
import { ref, computed } from 'vue'
import Card from 'primevue/card'
import Chart from 'primevue/chart'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Badge from 'primevue/badge'
import Avatar from 'primevue/avatar'
import InputText from 'primevue/inputtext'

// Client Statistics
const totalClients = ref(247)
const activeClients = ref(189)
const newClientsThisMonth = ref(23)
const clientSatisfaction = ref(4.7)

// Staff Statistics
const totalStaff = ref(42)
const activeStaff = ref(38)
const onLeave = ref(4)
const utilizationRate = computed(() => ((activeStaff.value / totalStaff.value) * 100).toFixed(1))

// Chart data for client growth
const clientGrowthChartData = ref({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'New Clients',
      data: [18, 22, 25, 19, 24, 28, 31, 27, 29, 26, 32, 23],
      fill: true,
      borderColor: '#10b981',
      tension: 0.4,
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
    },
    {
      label: 'Total Clients',
      data: [180, 192, 205, 215, 228, 239, 248, 235, 242, 230, 250, 247],
      fill: false,
      borderColor: '#3b82f6',
      tension: 0.4,
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
    }
  ]
})

// Staff distribution by department
const staffDistributionData = ref({
  labels: ['Engineering', 'Sales', 'Marketing', 'Support', 'HR', 'Finance'],
  datasets: [
    {
      label: 'Staff Count',
      data: [12, 8, 6, 7, 4, 5],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
      borderColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(139, 92, 246, 1)',
        'rgba(236, 72, 153, 1)',
        'rgba(239, 68, 68, 1)',
      ],
      borderWidth: 2
    }
  ]
})

// Clients data
const clients = ref([
  { 
    id: 1, 
    name: 'Acme Corporation', 
    contact: 'John Smith', 
    email: 'john.smith@acme.com', 
    phone: '+1 (555) 123-4567',
    status: 'Active', 
    projects: 5, 
    joinDate: '2022-03-15',
    value: 125000,
    industry: 'Technology'
  },
  { 
    id: 2, 
    name: 'Tech Solutions Inc', 
    contact: 'Sarah Johnson', 
    email: 'sarah.j@techsol.com', 
    phone: '+1 (555) 234-5678',
    status: 'Active', 
    projects: 3, 
    joinDate: '2023-06-20',
    value: 85000,
    industry: 'Software'
  },
  { 
    id: 3, 
    name: 'Global Industries', 
    contact: 'Michael Chen', 
    email: 'm.chen@globalind.com', 
    phone: '+1 (555) 345-6789',
    status: 'Active', 
    projects: 8, 
    joinDate: '2021-11-10',
    value: 285000,
    industry: 'Manufacturing'
  },
  { 
    id: 4, 
    name: 'Innovation Labs', 
    contact: 'Emily Davis', 
    email: 'emily.d@inno Labs.com', 
    phone: '+1 (555) 456-7890',
    status: 'Active', 
    projects: 2, 
    joinDate: '2024-01-15',
    value: 45000,
    industry: 'Startup'
  },
  { 
    id: 5, 
    name: 'Mega Corp', 
    contact: 'Robert Wilson', 
    email: 'r.wilson@megacorp.com', 
    phone: '+1 (555) 567-8901',
    status: 'Inactive', 
    projects: 12, 
    joinDate: '2020-05-22',
    value: 520000,
    industry: 'Enterprise'
  },
  { 
    id: 6, 
    name: 'Design Studio', 
    contact: 'Lisa Anderson', 
    email: 'lisa@designstudio.com', 
    phone: '+1 (555) 678-9012',
    status: 'Active', 
    projects: 4, 
    joinDate: '2023-09-08',
    value: 68000,
    industry: 'Creative'
  },
  { 
    id: 7, 
    name: 'StartupXYZ', 
    contact: 'David Brown', 
    email: 'david@startupxyz.com', 
    phone: '+1 (555) 789-0123',
    status: 'Pending', 
    projects: 1, 
    joinDate: '2024-12-01',
    value: 15000,
    industry: 'Technology'
  },
  { 
    id: 8, 
    name: 'Local Business Group', 
    contact: 'Jennifer Martinez', 
    email: 'j.martinez@lbg.com', 
    phone: '+1 (555) 890-1234',
    status: 'Active', 
    projects: 6, 
    joinDate: '2022-08-30',
    value: 95000,
    industry: 'Retail'
  },
])

// Staff data
const staff = ref([
  {
    id: 1,
    name: 'Alex Thompson',
    email: 'alex.thompson@company.com',
    phone: '+1 (555) 111-2222',
    role: 'Senior Developer',
    department: 'Engineering',
    status: 'Active',
    joinDate: '2021-03-15',
    projects: 8,
    avatar: 'AT'
  },
  {
    id: 2,
    name: 'Maria Garcia',
    email: 'maria.garcia@company.com',
    phone: '+1 (555) 222-3333',
    role: 'Sales Manager',
    department: 'Sales',
    status: 'Active',
    joinDate: '2020-06-20',
    projects: 15,
    avatar: 'MG'
  },
  {
    id: 3,
    name: 'James Wilson',
    email: 'james.wilson@company.com',
    phone: '+1 (555) 333-4444',
    role: 'Marketing Specialist',
    department: 'Marketing',
    status: 'Active',
    joinDate: '2022-01-10',
    projects: 12,
    avatar: 'JW'
  },
  {
    id: 4,
    name: 'Sophie Chen',
    email: 'sophie.chen@company.com',
    phone: '+1 (555) 444-5555',
    role: 'Support Lead',
    department: 'Support',
    status: 'Active',
    joinDate: '2021-11-05',
    projects: 20,
    avatar: 'SC'
  },
  {
    id: 5,
    name: 'Ryan O\'Brien',
    email: 'ryan.obrien@company.com',
    phone: '+1 (555) 555-6666',
    role: 'HR Manager',
    department: 'HR',
    status: 'On Leave',
    joinDate: '2019-08-12',
    projects: 5,
    avatar: 'RO'
  },
  {
    id: 6,
    name: 'Emma Johnson',
    email: 'emma.johnson@company.com',
    phone: '+1 (555) 666-7777',
    role: 'Financial Analyst',
    department: 'Finance',
    status: 'Active',
    joinDate: '2023-02-28',
    projects: 10,
    avatar: 'EJ'
  },
  {
    id: 7,
    name: 'Chris Martinez',
    email: 'chris.martinez@company.com',
    phone: '+1 (555) 777-8888',
    role: 'Junior Developer',
    department: 'Engineering',
    status: 'Active',
    joinDate: '2024-06-01',
    projects: 4,
    avatar: 'CM'
  },
  {
    id: 8,
    name: 'Olivia Davis',
    email: 'olivia.davis@company.com',
    phone: '+1 (555) 888-9999',
    role: 'Account Executive',
    department: 'Sales',
    status: 'Active',
    joinDate: '2022-09-15',
    projects: 18,
    avatar: 'OD'
  },
])

// Recent activities
const recentActivities = ref([
  { id: 1, type: 'client', action: 'New client added', name: 'StartupXYZ', time: '2 hours ago', icon: 'pi-user-plus' },
  { id: 2, type: 'staff', action: 'Staff member updated', name: 'Alex Thompson', time: '4 hours ago', icon: 'pi-user-edit' },
  { id: 3, type: 'client', action: 'Project completed', name: 'Acme Corporation', time: '6 hours ago', icon: 'pi-check-circle' },
  { id: 4, type: 'staff', action: 'Leave request approved', name: 'Ryan O\'Brien', time: '1 day ago', icon: 'pi-calendar-check' },
  { id: 5, type: 'client', action: 'Meeting scheduled', name: 'Tech Solutions Inc', time: '1 day ago', icon: 'pi-calendar' },
])

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        usePointStyle: true,
        padding: 15,
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
    }
  }
})

const pieChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        usePointStyle: true,
        padding: 15,
      }
    }
  }
})

const getStatusSeverity = (status) => {
  switch(status) {
    case 'Active': return 'success'
    case 'Inactive': return 'secondary'
    case 'Pending': return 'warning'
    case 'On Leave': return 'info'
    default: return null
  }
}

const getDepartmentColor = (department) => {
  const colors = {
    'Engineering': '#3b82f6',
    'Sales': '#10b981',
    'Marketing': '#f59e0b',
    'Support': '#8b5cf6',
    'HR': '#ec4899',
    'Finance': '#ef4444',
  }
  return colors[department] || '#6b7280'
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="container mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <i class="pi pi-users text-white text-xl"></i>
            </div>
            <div>
              <h1 class="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                TeamHub
              </h1>
              <p class="text-sm text-gray-500">Client & Staff Management Dashboard</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <Button icon="pi pi-bell" severity="secondary" text rounded />
            <Avatar label="AD" shape="circle" class="bg-gradient-to-br from-indigo-500 to-purple-500" />
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-6 py-8">
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Clients Card -->
        <Card class="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
          <template #content>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Total Clients</p>
                <p class="text-3xl font-bold text-gray-900">{{ totalClients }}</p>
                <div class="flex items-center gap-1 mt-2">
                  <i class="pi pi-arrow-up text-blue-600 text-xs"></i>
                  <span class="text-sm text-blue-600 font-semibold">+{{ newClientsThisMonth }} new</span>
                  <span class="text-sm text-gray-500">this month</span>
                </div>
              </div>
              <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <i class="pi pi-briefcase text-white text-2xl"></i>
              </div>
            </div>
          </template>
        </Card>

        <!-- Active Clients Card -->
        <Card class="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
          <template #content>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Active Clients</p>
                <p class="text-3xl font-bold text-gray-900">{{ activeClients }}</p>
                <div class="flex items-center gap-1 mt-2">
                  <i class="pi pi-check-circle text-green-600 text-xs"></i>
                  <span class="text-sm text-green-600 font-semibold">{{ ((activeClients / totalClients) * 100).toFixed(1) }}%</span>
                  <span class="text-sm text-gray-500">of total</span>
                </div>
              </div>
              <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <i class="pi pi-check text-white text-2xl"></i>
              </div>
            </div>
          </template>
        </Card>

        <!-- Total Staff Card -->
        <Card class="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-pink-50">
          <template #content>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Total Staff</p>
                <p class="text-3xl font-bold text-gray-900">{{ totalStaff }}</p>
                <div class="flex items-center gap-1 mt-2">
                  <i class="pi pi-users text-purple-600 text-xs"></i>
                  <span class="text-sm text-purple-600 font-semibold">{{ activeStaff }} active</span>
                  <span class="text-sm text-gray-500">{{ onLeave }} on leave</span>
                </div>
              </div>
              <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <i class="pi pi-users text-white text-2xl"></i>
              </div>
            </div>
          </template>
        </Card>

        <!-- Client Satisfaction Card -->
        <Card class="shadow-lg border-0 bg-gradient-to-br from-amber-50 to-orange-50">
          <template #content>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Client Satisfaction</p>
                <p class="text-3xl font-bold text-gray-900">{{ clientSatisfaction }}/5.0</p>
                <div class="flex items-center gap-1 mt-2">
                  <i class="pi pi-star-fill text-amber-600 text-xs"></i>
                  <span class="text-sm text-amber-600 font-semibold">Excellent</span>
                  <span class="text-sm text-gray-500">94% rating</span>
                </div>
              </div>
              <div class="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <i class="pi pi-star text-white text-2xl"></i>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Client Growth Chart -->
        <Card class="shadow-lg border-0">
          <template #title>
            <div class="flex items-center gap-2">
              <i class="pi pi-chart-line text-indigo-600"></i>
              <span>Client Growth Trend</span>
            </div>
          </template>
          <template #content>
            <div class="h-80">
              <Chart type="line" :data="clientGrowthChartData" :options="chartOptions" />
            </div>
          </template>
        </Card>

        <!-- Staff Distribution Chart -->
        <Card class="shadow-lg border-0">
          <template #title>
            <div class="flex items-center gap-2">
              <i class="pi pi-chart-pie text-indigo-600"></i>
              <span>Staff Distribution by Department</span>
            </div>
          </template>
          <template #content>
            <div class="h-80">
              <Chart type="doughnut" :data="staffDistributionData" :options="pieChartOptions" />
            </div>
          </template>
        </Card>
      </div>

      <!-- Tables and Activities Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Clients Table -->
        <Card class="shadow-lg border-0 lg:col-span-2">
          <template #title>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <i class="pi pi-briefcase text-indigo-600"></i>
                <span>Clients</span>
              </div>
              <div class="flex items-center gap-2">
                <InputText placeholder="Search..." class="w-48" />
                <Button label="Add Client" icon="pi pi-plus" size="small" />
              </div>
            </div>
          </template>
          <template #content>
            <DataTable :value="clients" :paginator="true" :rows="5" class="p-datatable-sm">
              <Column field="name" header="Client Name" />
              <Column field="contact" header="Contact" />
              <Column field="industry" header="Industry" />
              <Column field="projects" header="Projects">
                <template #body="{ data }">
                  <Badge :value="data.projects" severity="info" />
                </template>
              </Column>
              <Column field="value" header="Value">
                <template #body="{ data }">
                  <span class="font-semibold">{{ formatCurrency(data.value) }}</span>
                </template>
              </Column>
              <Column field="status" header="Status">
                <template #body="{ data }">
                  <Tag :value="data.status" :severity="getStatusSeverity(data.status)" />
                </template>
              </Column>
              <Column header="Actions">
                <template #body>
                  <div class="flex gap-2">
                    <Button icon="pi pi-eye" text size="small" />
                    <Button icon="pi pi-pencil" text size="small" />
                  </div>
                </template>
              </Column>
            </DataTable>
          </template>
        </Card>

        <!-- Recent Activities -->
        <Card class="shadow-lg border-0">
          <template #title>
            <div class="flex items-center gap-2">
              <i class="pi pi-clock text-indigo-600"></i>
              <span>Recent Activities</span>
            </div>
          </template>
          <template #content>
            <div class="space-y-4">
              <div v-for="activity in recentActivities" :key="activity.id" class="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div :class="activity.type === 'client' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'" class="w-10 h-10 rounded-lg flex items-center justify-center">
                  <i :class="activity.icon" class="text-sm"></i>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">{{ activity.action }}</p>
                  <p class="text-xs text-gray-600">{{ activity.name }}</p>
                  <p class="text-xs text-gray-400 mt-1">{{ activity.time }}</p>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Staff Table -->
      <Card class="shadow-lg border-0">
        <template #title>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <i class="pi pi-users text-indigo-600"></i>
              <span>Staff Members</span>
            </div>
            <div class="flex items-center gap-2">
              <InputText placeholder="Search staff..." class="w-48" />
              <Button label="Add Staff" icon="pi pi-user-plus" size="small" />
            </div>
          </div>
        </template>
        <template #content>
          <DataTable :value="staff" :paginator="true" :rows="5" class="p-datatable-sm">
            <Column header="Staff">
              <template #body="{ data }">
                <div class="flex items-center gap-3">
                  <Avatar :label="data.avatar" shape="circle" :style="{ backgroundColor: getDepartmentColor(data.department) }" />
                  <div>
                    <p class="font-semibold text-gray-900">{{ data.name }}</p>
                    <p class="text-xs text-gray-500">{{ data.email }}</p>
                  </div>
                </div>
              </template>
            </Column>
            <Column field="role" header="Role" />
            <Column field="department" header="Department">
              <template #body="{ data }">
                <Tag :value="data.department" :style="{ backgroundColor: getDepartmentColor(data.department) + '20', color: getDepartmentColor(data.department), borderColor: getDepartmentColor(data.department) }" />
              </template>
            </Column>
            <Column field="projects" header="Projects">
              <template #body="{ data }">
                <Badge :value="data.projects" severity="info" />
              </template>
            </Column>
            <Column field="joinDate" header="Joined">
              <template #body="{ data }">
                {{ formatDate(data.joinDate) }}
              </template>
            </Column>
            <Column field="status" header="Status">
              <template #body="{ data }">
                <Tag :value="data.status" :severity="getStatusSeverity(data.status)" />
              </template>
            </Column>
            <Column header="Actions">
              <template #body>
                <div class="flex gap-2">
                  <Button icon="pi pi-eye" text size="small" />
                  <Button icon="pi pi-pencil" text size="small" />
                  <Button icon="pi pi-envelope" text size="small" />
                </div>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </main>
  </div>
</template>

<style scoped>
:deep(.p-card) {
  border-radius: 12px;
}

:deep(.p-datatable) {
  font-size: 0.875rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
  font-weight: 600;
  color: #475569;
  padding: 1rem;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  transition: background-color 0.2s;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background-color: #f1f5f9;
}
</style>
