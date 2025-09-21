// DUMMY PROTECTED ROUTE - Always allows access for demo!
const ProtectedRoute = ({ children }) => {
  console.log('🎭 DEMO MODE: ProtectedRoute bypassed - allowing access!')
  
  // Always return children - no authentication checks!
  return children
}

export default ProtectedRoute
