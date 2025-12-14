import { useEffect, useState } from "react";

export function useUserData() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await res.json();

        if (isMounted) {
          setUserData(data.user);
        }

        console.log("Fetched user data:", data.user);
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUserData();

  
  }, []);

  return { userData, loading, error };
}

/*
Usage:

import { useUserData } from "@/hooks/useUserData";

const { userData, loading, error } = useUserData();
*/
