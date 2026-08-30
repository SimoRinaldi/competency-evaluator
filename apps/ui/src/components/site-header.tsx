import { useLocation, Link } from "react-router-dom"
import { SidebarTrigger } from "./ui/sidebar"
import { Separator } from "./ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb"
import React from "react"

const routeTranslations: Record<string, string> = {
  "competencies": "Gestione Competenze",
  "new": "Creazione",
  "rubrics": "Gestione Rubriche",
  "users": "Gestione Utenti",
  "tests-overview": "Visualizzazione Test",
  "tests-management": "Gestione Test",
  "indicators-management": "Oggetti di Osservazione e Indicatori",
  "evaluations": "Valutazioni",
  "pending": "In Attesa",
  "completed": "Completati",
  "my-tests": "I Miei Test",
  "todo": "Da Fare",
  "history": "Risultati Storici",
};

export function SiteHeader() {
  const location = useLocation()
  
  const pathnames = location.pathname.split('/').filter((x) => x)

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 px-4">
      <div className="flex items-center gap-2 w-full">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              {pathnames.length === 0 ? (
                <BreadcrumbPage>Pannello di controllo</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to="/">Pannello di controllo</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {pathnames.length > 0 && (
              <BreadcrumbSeparator className="hidden md:block" />
            )}
            {pathnames.map((value, index) => {
              const to = `/${pathnames.slice(0, index + 1).join('/')}`
              const isLast = index === pathnames.length - 1
              
              // Traduzione o fallback al nome original formattato
              const title = routeTranslations[value] || (value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' '))
              
              return (
                <React.Fragment key={to}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{title}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={to}>{title}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}
