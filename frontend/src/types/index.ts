export type EmployeeType    = 'PART_TIME' | 'FULL_TIME';
export type EmployeeRole    = 'STORE_MANAGER' | 'SHIFT_SUPERVISOR' | 'MEAT_TECHNICIAN';
export type LoginMethod     = 'FACE_BIOMETRIC' | 'OTP';
export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'EARLY_EXIT';
export type Indicator       = 'GREEN' | 'AMBER' | 'RED';

export interface Store {
  id: string; storeCode: string; name: string;
  latitude: number; longitude: number;
  address: string; city: string; geofenceRadius: number;
}

export interface Employee {
  id: string; employeeCode: string; name: string;
  email: string; phone: string;
  type: EmployeeType; role: EmployeeRole;
  storeId: string; storeName?: string; isActive: boolean;
}

export interface Shift {
  id: string; shiftCode: string; name: string;
  startTime: string; endTime: string; storeId: string;
}

export interface ManpowerPlan {
  id: string; storeId: string; shiftId: string;
  role: EmployeeRole; plannedCount: number; date: string;
  shift?: Shift;
}

export interface AttendanceRecord {
  id: string; employeeId: string; storeId: string; shiftId: string; date: string;
  checkInTime?: string; checkOutTime?: string;
  loginMethod?: LoginMethod; checkInLat?: number; checkInLng?: number;
  status: AttendanceStatus; overrideReason?: string;
  employee?: Employee; shift?: Shift;
}

export interface RoleBreakdown { role: EmployeeRole; planned: number; actual: number; }

export interface ShiftBreakdown {
  shift: Shift; totalPlanned: number; present: number;
  percentage: number; indicator: Indicator; roleBreakdown: RoleBreakdown[];
}

export interface StoreDashboard {
  store: Store; date: string;
  summary: { totalPlanned: number; totalPresent: number; percentage: number; indicator: Indicator; lateCount: number; earlyExitCount: number; absentCount: number; };
  shiftBreakdown: ShiftBreakdown[];
  employeeLists: { present: AttendanceRecord[]; late: AttendanceRecord[]; earlyExit: AttendanceRecord[]; absent: Employee[]; notCheckedIn: Employee[]; };
}

export interface StoreOpsData {
  store: Store; totalPlanned: number; present: number;
  late: number; earlyExit: number; absent: number;
  percentage: number; indicator: Indicator; roleBreakdown: RoleBreakdown[];
}

export interface OpsDashboard {
  date: string; stores: StoreOpsData[];
  summary: { planned: number; present: number; late: number; earlyExit: number; absent: number; compliance: number; };
}

export interface AuthUser {
  id: string; name: string; email: string; phone: string;
  role: EmployeeRole; type: EmployeeType;
  storeId: string; storeName: string; employeeCode: string;
}
