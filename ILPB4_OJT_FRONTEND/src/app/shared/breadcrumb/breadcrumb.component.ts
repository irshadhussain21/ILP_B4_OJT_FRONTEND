import { CommonModule, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, RouterLink, RouterModule } from '@angular/router';
import { filter, map } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.css'],
  imports: [CommonModule,RouterLink,RouterModule]
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs: Array<{label: string, url: string}> = [];

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.buildBreadcrumbs(this.activatedRoute.root))
    ).subscribe((breadcrumbs) => {
      this.breadcrumbs = breadcrumbs;
    });
  }

  private buildBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: Array<{label: string, url: string}> = []): Array<{label: string, url: string}> {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      const breadcrumbLabel = child.snapshot.data['breadcrumb'] || routeURL;
      if (breadcrumbLabel) {
        breadcrumbs.push({ label: breadcrumbLabel, url });
      }
      console.log(this.buildBreadcrumbs(child,url,breadcrumbs))
      return this.buildBreadcrumbs(child, url, breadcrumbs);
    }
    console.log(breadcrumbs);
    return breadcrumbs;
  }
}
