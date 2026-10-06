'use client'

import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface UserProviderProps {
  children: ReactNode;
  id: string | undefined
}

interface UserProps {
    user: {
        firstName: string;
        lastName: string;
        email: string;
    };
}

export const UserContext = createContext<UserProps | null> (null);

export const UserProvider = ({ children, id }: UserProviderProps) => {
    const [user, setUser] = useState({
        firstName :'',
        lastName: '', 
        email: ''
    });



    const fetchUserData = async () => {
        try {
            const response = await fetch(`/api/user/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            const data = await response.json();
            setUser(data.data);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }

    useEffect(() => {
        fetchUserData();
    }, []);
    
  return (
    <UserContext.Provider value={{ user }}> 
      {children}
    </UserContext.Provider>
  );
};


export const userAdmin = () => {
    const context = useContext(UserContext);
    if (context === null) {
      throw new Error("userAdmin must be used within a UserProvider");
    }
    return context;
};  

