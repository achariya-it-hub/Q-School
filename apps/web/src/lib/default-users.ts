export type UserRole = "Admin" | "CentreManager" | "Faculty" | "Counsellor" | "Finance" | "Student";

export interface SeedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  location?: string;
  centreId?: string;
  status: "Active" | "Suspended";
  joined: string;
  phone?: string;
  password?: string;
}

export const DEFAULT_USERS: SeedUser[] = [
  {
    id: "usr_admin1",
    name: "Admin",
    email: "admin@qschool.com",
    role: "Admin",
    status: "Active",
    joined: "2026-01-01",
    phone: "",
    password: "adminpassword123",
  },
  {
    id: "usr_admin2",
    name: "Admin",
    email: "admin@theqschool.com",
    role: "Admin",
    status: "Active",
    joined: "2026-01-01",
    phone: "",
    password: "adminpassword123",
  },
  {
    id: "usr_pondy",
    name: "Faculty - Pondy",
    email: "pondy@theqschool.com",
    role: "CentreManager",
    location: "pondy",
    centreId: "mk",
    status: "Active",
    joined: "2026-10-30",
    phone: "",
    password: "admin123",
  },
  {
    id: "usr_adyar",
    name: "Faculty - Adyar",
    email: "adyar@theqschool.com",
    role: "CentreManager",
    location: "adyar",
    centreId: "ad",
    status: "Active",
    joined: "2026-10-30",
    phone: "",
    password: "admin123",
  },
  {
    id: "usr_wk",
    name: "Faculty - WK",
    email: "wk@theqschool.com",
    role: "CentreManager",
    location: "wk",
    centreId: "vl",
    status: "Active",
    joined: "2026-10-30",
    phone: "",
    password: "admin123",
  },
  {
    id: "usr_coimbatore",
    name: "Faculty - Coimbatore",
    email: "coimbatore@theqschool.com",
    role: "CentreManager",
    location: "coimbatore",
    centreId: "sc",
    status: "Active",
    joined: "2026-10-30",
    phone: "",
    password: "admin123",
  },
  {
    id: "usr_pune",
    name: "Faculty - Pune",
    email: "pune@theqschool.com",
    role: "CentreManager",
    location: "Pune",
    centreId: "au",
    status: "Active",
    joined: "2026-10-30",
    phone: "",
    password: "admin123",
  },
  {
    id: "usr_hyderabad",
    name: "Faculty - Hyderabad",
    email: "hyderabad@theqschool.com",
    role: "CentreManager",
    location: "Hyderabad",
    centreId: "bh",
    status: "Active",
    joined: "2026-10-30",
    phone: "",
    password: "admin123",
  },
  {
    id: "usr_ksm",
    name: "Faculty - Kasturi Nagar",
    email: "ksm@theqschool.com",
    role: "CentreManager",
    location: "Kasturi Nagar",
    centreId: "kn",
    status: "Active",
    joined: "2026-10-30",
    phone: "",
    password: "admin123",
  },
  {
    id: "usr_whitefield",
    name: "Faculty - Whitefield",
    email: "whitefield@theqschool.com",
    role: "CentreManager",
    location: "Whitefield",
    centreId: "wf",
    status: "Active",
    joined: "2026-10-30",
    phone: "",
    password: "admin123",
  },
  {
    id: "usr_trichy",
    name: "Faculty - Trichy",
    email: "trichy@theqschool.com",
    role: "CentreManager",
    location: "Trichy",
    centreId: "tn",
    status: "Active",
    joined: "2026-10-30",
    phone: "",
    password: "admin123",
  },
];

