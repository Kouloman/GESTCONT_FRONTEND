import { v4 as uuidv4 } from 'uuid';

// Mock user data
const users = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@gestcont.com',
    password: 'admin123',
    role: 'admin',
    permissions: ['all'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    username: 'user',
    email: 'user@gestcont.com',
    password: 'user123',
    role: 'user',
    permissions: ['read:containers', 'create:containers', 'update:containers'],
    createdAt: new Date().toISOString(),
  },
];

// Mock shipping lines
const shippingLines = [
  { id: '1', name: 'Maersk', code: 'MSK', active: true },
  { id: '2', name: 'MSC', code: 'MSC', active: true },
  { id: '3', name: 'CMA CGM', code: 'CMA', active: true },
  { id: '4', name: 'Hapag-Lloyd', code: 'HPL', active: true },
  { id: '5', name: 'Evergreen', code: 'EGL', active: true },
  { id: '6', name: 'COSCO', code: 'COS', active: true },
];

// Mock ISO codes
const isoCodes = [
  { id: '1', code: '22G1', description: '20\' General Purpose', active: true },
  { id: '2', code: '42G1', description: '40\' General Purpose', active: true },
  { id: '3', code: '45G1', description: '40\' High Cube', active: true },
  { id: '4', code: '22R1', description: '20\' Refrigerated', active: true },
  { id: '5', code: '42R1', description: '40\' Refrigerated', active: true },
];

// Mock clients
const clients = [
  { id: '1', name: 'Bolloré Transport & Logistics', code: 'BTL', active: true },
  { id: '2', name: 'Necotrans', code: 'NCT', active: true },
  { id: '3', name: 'SDV', code: 'SDV', active: true },
];

// Generate mock containers
const generateMockContainers = (count = 50) => {
  const containers = [];
  const types = ['DRY', 'REEFER'];
  const statuses = ['IN_PARK', 'OUT', 'BOOKED'];
  
  for (let i = 0; i < count; i++) {
    const shippingLine = shippingLines[Math.floor(Math.random() * shippingLines.length)];
    const isoCode = isoCodes[Math.floor(Math.random() * isoCodes.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const prefix = shippingLine.code.substring(0, 3);
    const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const checkDigit = Math.floor(Math.random() * 10);
    
    const containerNumber = `${prefix}U${number}${checkDigit}`;
    
    const entryDate = new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000);
    let exitDate = null;
    
    if (status === 'OUT') {
      exitDate = new Date(entryDate.getTime() + Math.floor(Math.random() * 15) * 86400000);
    }
    
    containers.push({
      id: i.toString(),
      containerNumber,
      shippingLineId: shippingLine.id,
      shippingLineName: shippingLine.name,
      isoCodeId: isoCode.id,
      isoCode: isoCode.code,
      type,
      status,
      entryDate: entryDate.toISOString(),
      exitDate: exitDate ? exitDate.toISOString() : null,
      booking: status === 'BOOKED' ? `BK${Math.floor(Math.random() * 100000)}` : null,
      vessel: status === 'OUT' ? ['MAERSK TEMA', 'MSC ANNA', 'CMA CGM ANTOINE', 'EVER GIVEN'][Math.floor(Math.random() * 4)] : null,
      client: status !== 'IN_PARK' ? clients[Math.floor(Math.random() * clients.length)].name : null,
      damages: Math.random() > 0.7 ? 'Minor dents on side panel' : null,
      transporter: ['TransCo', 'FastFreight', 'GlobalLogistics', 'ExpressCargo'][Math.floor(Math.random() * 4)],
      truckRef: `T-${Math.floor(Math.random() * 1000)}`,
      comments: Math.random() > 0.8 ? 'Container needs inspection before next use' : '',
      createdAt: entryDate.toISOString(),
      updatedAt: exitDate ? exitDate.toISOString() : entryDate.toISOString(),
    });
  }
  
  return containers;
};

const mockContainers = generateMockContainers();

// Mock auth service
export const mockAuthService = {
  login: async (username: string, password: string) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return { success: true, user: userWithoutPassword };
    }
    return { success: false, message: 'Invalid credentials' };
  },
  
  getCurrentUser: async () => {
    // In a real app, this would verify the token
    // Here we just return the admin user
    const { password, ...userWithoutPassword } = users[0];
    return userWithoutPassword;
  },
};

// Mock shipping lines service
export const mockShippingLineService = {
  getAll: async () => {
    return shippingLines;
  },
  
  getById: async (id: string) => {
    return shippingLines.find(sl => sl.id === id);
  },
  
  create: async (data: any) => {
    const newShippingLine = {
      id: uuidv4(),
      ...data,
      active: true,
    };
    shippingLines.push(newShippingLine);
    return newShippingLine;
  },
  
  update: async (id: string, data: any) => {
    const index = shippingLines.findIndex(sl => sl.id === id);
    if (index !== -1) {
      shippingLines[index] = { ...shippingLines[index], ...data };
      return shippingLines[index];
    }
    throw new Error('Shipping line not found');
  },
  
  delete: async (id: string) => {
    const index = shippingLines.findIndex(sl => sl.id === id);
    if (index !== -1) {
      shippingLines.splice(index, 1);
      return { success: true };
    }
    throw new Error('Shipping line not found');
  },
};

// Mock ISO codes service
export const mockIsoCodeService = {
  getAll: async () => {
    return isoCodes;
  },
  
  getById: async (id: string) => {
    return isoCodes.find(iso => iso.id === id);
  },
  
  create: async (data: any) => {
    const newIsoCode = {
      id: uuidv4(),
      ...data,
      active: true,
    };
    isoCodes.push(newIsoCode);
    return newIsoCode;
  },
  
  update: async (id: string, data: any) => {
    const index = isoCodes.findIndex(iso => iso.id === id);
    if (index !== -1) {
      isoCodes[index] = { ...isoCodes[index], ...data };
      return isoCodes[index];
    }
    throw new Error('ISO code not found');
  },
  
  delete: async (id: string) => {
    const index = isoCodes.findIndex(iso => iso.id === id);
    if (index !== -1) {
      isoCodes.splice(index, 1);
      return { success: true };
    }
    throw new Error('ISO code not found');
  },
};

// Mock clients service
export const mockClientService = {
  getAll: async () => {
    return clients;
  },
  
  getById: async (id: string) => {
    return clients.find(client => client.id === id);
  },
  
  create: async (data: any) => {
    const newClient = {
      id: uuidv4(),
      ...data,
      active: true,
    };
    clients.push(newClient);
    return newClient;
  },
  
  update: async (id: string, data: any) => {
    const index = clients.findIndex(client => client.id === id);
    if (index !== -1) {
      clients[index] = { ...clients[index], ...data };
      return clients[index];
    }
    throw new Error('Client not found');
  },
  
  delete: async (id: string) => {
    const index = clients.findIndex(client => client.id === id);
    if (index !== -1) {
      clients.splice(index, 1);
      return { success: true };
    }
    throw new Error('Client not found');
  },
};

// Mock containers service
export const mockContainerService = {
  getAll: async (params: any = {}) => {
    let filteredContainers = [...mockContainers];
    
    // Apply filters
    if (params.status) {
      filteredContainers = filteredContainers.filter(c => c.status === params.status);
    }
    
    if (params.shippingLineId) {
      filteredContainers = filteredContainers.filter(c => c.shippingLineId === params.shippingLineId);
    }
    
    if (params.type) {
      filteredContainers = filteredContainers.filter(c => c.type === params.type);
    }
    
    if (params.containerNumber) {
      filteredContainers = filteredContainers.filter(c => 
        c.containerNumber.toLowerCase().includes(params.containerNumber.toLowerCase())
      );
    }
    
    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const paginatedContainers = filteredContainers.slice(startIndex, endIndex);
    
    return {
      containers: paginatedContainers,
      total: filteredContainers.length,
      page,
      limit,
      totalPages: Math.ceil(filteredContainers.length / limit),
    };
  },
  
  getById: async (id: string) => {
    return mockContainers.find(c => c.id === id);
  },
  
  getByContainerNumber: async (containerNumber: string) => {
    return mockContainers.find(c => c.containerNumber === containerNumber);
  },
  
  create: async (data: any) => {
    const newContainer = {
      id: uuidv4(),
      ...data,
      status: 'IN_PARK',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockContainers.push(newContainer);
    return newContainer;
  },
  
  update: async (id: string, data: any) => {
    const index = mockContainers.findIndex(c => c.id === id);
    if (index !== -1) {
      mockContainers[index] = { 
        ...mockContainers[index], 
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return mockContainers[index];
    }
    throw new Error('Container not found');
  },
  
  delete: async (id: string) => {
    const index = mockContainers.findIndex(c => c.id === id);
    if (index !== -1) {
      mockContainers.splice(index, 1);
      return { success: true };
    }
    throw new Error('Container not found');
  },
  
  exitContainer: async (containerNumber: string, exitData: any) => {
    const container = mockContainers.find(c => c.containerNumber === containerNumber);
    if (!container) {
      throw new Error('Container not found');
    }
    
    if (container.status !== 'IN_PARK') {
      throw new Error('Container is not in the park');
    }
    
    const index = mockContainers.findIndex(c => c.id === container.id);
    mockContainers[index] = {
      ...container,
      status: 'OUT',
      exitDate: new Date().toISOString(),
      ...exitData,
      updatedAt: new Date().toISOString(),
    };
    
    return mockContainers[index];
  },
  
  getDashboardStats: async () => {
    const totalContainers = mockContainers.length;
    const containersInPark = mockContainers.filter(c => c.status === 'IN_PARK').length;
    const containersOut = mockContainers.filter(c => c.status === 'OUT').length;
    const containersBooked = mockContainers.filter(c => c.status === 'BOOKED').length;
    
    const dryContainers = mockContainers.filter(c => c.type === 'DRY').length;
    const reeferContainers = mockContainers.filter(c => c.type === 'REEFER').length;
    
    const shippingLineStats = shippingLines.map(sl => {
      const count = mockContainers.filter(c => c.shippingLineId === sl.id && c.status === 'IN_PARK').length;
      return {
        id: sl.id,
        name: sl.name,
        count,
      };
    });
    
    const movementsByDay = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dateStr = date.toISOString().split('T')[0];
      
      const entries = mockContainers.filter(c => {
        const entryDate = new Date(c.entryDate);
        return entryDate.toISOString().split('T')[0] === dateStr;
      }).length;
      
      const exits = mockContainers.filter(c => {
        if (!c.exitDate) return false;
        const exitDate = new Date(c.exitDate);
        return exitDate.toISOString().split('T')[0] === dateStr;
      }).length;
      
      return {
        date: dateStr,
        entries,
        exits,
      };
    }).reverse();
    
    return {
      totalContainers,
      containersInPark,
      containersOut,
      containersBooked,
      dryContainers,
      reeferContainers,
      shippingLineStats,
      movementsByDay,
    };
  },
};

// Mock users service
export const mockUserService = {
  getAll: async () => {
    return users.map(({ password, ...user }) => user);
  },
  
  getById: async (id: string) => {
    const user = users.find(u => u.id === id);
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  },
  
  create: async (data: any) => {
    const newUser = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },
  
  update: async (id: string, data: any) => {
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...data };
      
      const { password, ...userWithoutPassword } = users[index];
      return userWithoutPassword;
    }
    throw new Error('User not found');
  },
  
  delete: async (id: string) => {
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users.splice(index, 1);
      return { success: true };
    }
    throw new Error('User not found');
  },
};