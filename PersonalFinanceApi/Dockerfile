# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY PersonalFinanceApi.csproj ./
RUN dotnet restore PersonalFinanceApi.csproj

COPY . .
RUN dotnet publish PersonalFinanceApi.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "dotnet PersonalFinanceApi.dll --urls http://0.0.0.0:${PORT:-8080}"]
