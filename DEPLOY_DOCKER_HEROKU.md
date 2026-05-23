# Docker + Heroku Deployment Guide

This repo now supports running everything in Docker locally and deploying Docker images to Heroku.

## 1) Run Locally With Docker Compose

From the repository root:

```bash
docker compose up --build
```

Services:

- Web: http://localhost:5173
- API: http://localhost:5254
- SQL Server: localhost:1433

Compose wiring:

- Web calls API via `VITE_API_URL=http://localhost:5254/api`
- API uses SQL Server container via `ConnectionStrings__DefaultConnection`

## 2) Build Images Manually (Optional)

```bash
docker build -t personal-finance-api ./PersonalFinanceApi
docker build -t personal-finance-web --build-arg VITE_API_URL=https://YOUR-API-URL/api ./personal-finance-client
```

## 3) Deploy API Container to Heroku

Heroku has no managed SQL Server. Use an external SQL Server (for example Azure SQL) and set its connection string.

```bash
heroku login
heroku create personal-finance-api-prod
heroku stack:set container -a personal-finance-api-prod
heroku container:login
cd PersonalFinanceApi
heroku container:push web -a personal-finance-api-prod
heroku container:release web -a personal-finance-api-prod
cd ..
```

Set API environment variables:

```bash
heroku config:set \
	ConnectionStrings__DefaultConnection="Server=tcp:YOUR_SQL_SERVER,1433;Database=PersonalFinanceDb;User Id=YOUR_USER;Password=YOUR_PASSWORD;TrustServerCertificate=True;MultipleActiveResultSets=true" \
	Cors__AllowedOrigins__0="https://personal-finance-web-prod.herokuapp.com" \
	DisableHttpsRedirection="true" \
	-a personal-finance-api-prod
```

> The API container now uses Heroku release phase migration handling. When `heroku container:release` runs, the container executes `dotnet PersonalFinanceApi.dll --migrate` first to apply EF Core migrations before starting the web process.


## 4) Deploy Web Container to Heroku

Create a second Heroku app for the frontend:

```bash
heroku create personal-finance-web-prod
heroku stack:set container -a personal-finance-web-prod
heroku container:login
```

Because Vite variables are baked at build time, build and push with API URL set:

```bash
docker build \
	-t registry.heroku.com/personal-finance-web-prod/web \
	--build-arg VITE_API_URL=https://personal-finance-api-prod.herokuapp.com/api \
	./personal-finance-client

docker push registry.heroku.com/personal-finance-web-prod/web
heroku container:release web -a personal-finance-web-prod
```

## 5) Notes

- If web and API are on different domains, CORS must include the web domain in the API app config.
- For production you should use strong DB credentials and rotate secrets.
- If you change `VITE_API_URL`, rebuild and redeploy the web image.

