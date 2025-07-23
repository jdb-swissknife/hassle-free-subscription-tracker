import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      console.log('📱 useIsMobile hook:', { 
        width: window.innerWidth, 
        mobile, 
        breakpoint: MOBILE_BREAKPOINT 
      });
      setIsMobile(mobile);
    }
    
    // Check immediately
    checkIsMobile()
    
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => checkIsMobile()
    
    // Use both methods for better reliability
    mql.addEventListener("change", onChange)
    window.addEventListener("resize", onChange)
    
    return () => {
      mql.removeEventListener("change", onChange)
      window.removeEventListener("resize", onChange)
    }
  }, [])

  return isMobile
}
