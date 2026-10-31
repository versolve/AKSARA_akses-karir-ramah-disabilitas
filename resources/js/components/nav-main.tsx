import { Link } from '@inertiajs/react';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { ReactElement } from 'react';
import type { NavItem } from '@/types';

export function NavMain({ items, label = 'Platform' }: { items: NavItem[]; label?: string }): ReactElement {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-3 py-0">
            <SidebarGroupLabel className="px-3 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
                {label}
            </SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={isCurrentUrl(item.href)}
                            tooltip={{ children: item.title }}
                            className="min-h-11 rounded-xl px-3 text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 data-[active=true]:bg-blue-50 data-[active=true]:font-bold data-[active=true]:text-blue-700"
                        >
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon className="h-[18px] w-[18px]" />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
