export interface Access {
    id: number;
    name: string;
  }
  
  export interface Role {
    id: number;
    name: string;
    accesses: Access[];
  }
  