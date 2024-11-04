import React from 'react';
import { Search } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type NavbarProps = {
  username: string;
};

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none rounded-lg p-4 leading-none no-underline outline-none transition-colors",
            "hover:bg-blue-50 hover:text-blue-600",
            "focus:bg-blue-50 focus:text-blue-600",
            className
          )}
          {...props}
        >
          <div className="text-sm font-semibold mb-2">{title}</div>
          <p className="line-clamp-2 text-sm leading-relaxed text-gray-500">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

const problemTypes = [
  {
    title: "Algorithms",
    href: "/problems/algorithms",
    description: "Master fundamental algorithms and problem-solving techniques."
  },
  {
    title: "Data Structures",
    href: "/problems/data-structures",
    description: "Learn and implement essential data structures."
  },
  {
    title: "Dynamic Programming",
    href: "/problems/dp",
    description: "Practice optimization problems and breaking them into subproblems."
  },
  {
    title: "System Design",
    href: "/problems/system-design",
    description: "Design scalable systems and architectural patterns."
  },
];

const Navbar: React.FC<NavbarProps> = ({ username }) => {
  const userInitials = username ? username.split(' ').map(n => n[0]).join('').toUpperCase() : 'GU';
  // const defaultUser = {
  //   name: "Guest User",
  //   initials: "GU",
  //   image: "/api/placeholder/32/32" // Using placeholder API for default avatar
  // };
  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">
        
        <div className="flex items-center space-x-3">
          {/* <img 
            src="/api/placeholder/128/40" 
            alt="Logo" 
            className="h-8 w-auto" 
          /> */}
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            HireMe
          </span>
        </div>

        {/* Navigation Menu */}
        <NavigationMenu className="hidden md:block">
          <NavigationMenuList className="space-x-2">
            <NavigationMenuItem>
              <NavigationMenuTrigger className="h-10 px-4 py-2 text-sm font-medium transition-colors hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600 rounded-lg">
                Explore
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <a
                        className="flex h-full w-full select-none flex-col justify-end rounded-lg bg-gradient-to-br from-blue-50 via-blue-100 to-white p-6 no-underline outline-none focus:shadow-md"
                        href="/featured"
                      >
                        <div className="mb-2 mt-4 text-lg font-semibold text-blue-600">
                          Featured Problems
                        </div>
                        <p className="text-sm leading-relaxed text-gray-600">
                          Curated collection of top-rated problems to enhance your coding skills and prepare for technical interviews.
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                  <ListItem href="/trending" title="Trending">
                    Discover what other developers are practicing right now.
                  </ListItem>
                  <ListItem href="/competitions" title="Competitions">
                    Participate in coding competitions and challenges.
                  </ListItem>
                  <ListItem href="/discussion" title="Discussion">
                    Join the community discussion about various problems.
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger className="h-10 px-4 py-2 text-sm font-medium transition-colors hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600 rounded-lg">
                Problems
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-6 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  {problemTypes.map((problem) => (
                    <ListItem
                      key={problem.title}
                      title={problem.title}
                      href={problem.href}
                    >
                      {problem.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink className="h-10 px-4 py-2 text-sm font-medium transition-colors hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600 rounded-lg inline-flex items-center">
                Contest
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink className="h-10 px-4 py-2 text-sm font-medium transition-colors hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600 rounded-lg inline-flex items-center">
                Interview
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Search & Profile */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search problems..."
              className="w-64 pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          <button className="h-10 px-5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all">
            Premium
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center space-x-2 focus:outline-none">
              <div className="flex items-center space-x-2 rounded-full hover:bg-gray-100 p-1 transition-colors">
              <Avatar className="h-8 w-8">
                  <AvatarImage src="/api/placeholder/32/32" alt={username} />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">{username}</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                My Submissions
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                Saved Problems
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-red-600">
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;