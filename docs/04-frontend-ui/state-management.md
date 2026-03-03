# Global State Management

Unlike complex frontend applications that might require Redux, Zustand, or extensive React Context structures, the Intranet Portal adheres to a highly decoupled and simplistic state management architecture.

## Primary Method: Session Storage

Global application state (such as authentication status and user roles) is stored almost entirely in browser `sessionStorage`.

In `App.jsx`, the root application state initializes by reading from storage:

```javascript
const [isLoggedIn, setIsLoggedIn] = useState(
  sessionStorage.getItem('isLoggedIn') === 'true'
);
const [userRole, setUserRole] = useState(sessionStorage.getItem('userRole') || '');
const [usersubRole, setUsersubRole] = useState(sessionStorage.getItem('usersubRole') || '');
```

### Why Session Storage?
1. **Security / Durability:** `sessionStorage` survives page reloads but is automatically wiped when the user closes their browser tab, providing a natural "logout" mechanism without requiring complex heartbeat servers to track inactive sessions.
2. **Simplicity:** It avoids the boilerplate of Context Providers.

### Passing State (Prop Drilling)
Because the state hooks exist at the pinnacle of the component tree (`App.jsx`), they are passed down to child routes (like the `LoginForm`) via props. 

For example, when a user successfully logs in, the `LoginForm` calls `setIsLoggedIn(true)` and `setUserRole(req.role)` (which were passed in as props). A `useEffect` inside `App.jsx` listens for changes to these states and automatically synchronizes them back into physical `sessionStorage`.

## Server State (Data Fetching)

Data fetched from the backend (Announcements, Users, Timetables) is treated as ephemeral "Server State". 

Rather than caching lists of announcements in a global Redux store, each Dashboard container or Feature modal fetches its own requisite data using Axios inside an isolated `useEffect` hook upon mounting.
