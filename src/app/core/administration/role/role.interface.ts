export interface Access {
    id: number;
    name: string;
    order: number;
    dad: number;
  }
  
  export interface Role {
    id: number;
    name: string;
    accesses: Access[];
  }
  