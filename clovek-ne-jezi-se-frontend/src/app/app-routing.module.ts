import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: `login`,
    loadChildren: () =>
      import('./components/account/login/login.module').then(
        (m) => m.LoginModule
      ),
    //canActivate: [UnAuthGuard],
  },
  {
    path: `register`,
    loadChildren: () =>
      import('./components/account/register/register.module').then(
        (m) => m.RegisterModule
      ),
    //canActivate: [UnAuthGuard],
  },
  {
    path: `error`,
    loadChildren: () =>
      import('./components/error/error.module').then((m) => m.ErrorModule),
  },
  {
    path: ``,
    loadChildren: () =>
      import('./components/home/home.module').then((m) => m.HomeModule),
    //canActivate: [AuthGuard],
  },
  {
    path: '**',
    redirectTo: `/error`,
  },
];

const routeConfig: ExtraOptions = {
  paramsInheritanceStrategy: 'always',
};

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
