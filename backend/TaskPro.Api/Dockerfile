FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY TaskPro.Api/TaskPro.Api.csproj TaskPro.Api/TaskPro.Api.csproj
COPY TaskPro.Application/TaskPro.Application.csproj TaskPro.Application/TaskPro.Application.csproj
COPY TaskPro.Domain/TaskPro.Domain.csproj TaskPro.Domain/TaskPro.Domain.csproj
COPY TaskPro.Infrastructure/TaskPro.Infrastructure.csproj TaskPro.Infrastructure/TaskPro.Infrastructure.csproj

RUN dotnet restore TaskPro.Api/TaskPro.Api.csproj

COPY . .

RUN dotnet publish TaskPro.Api/TaskPro.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "TaskPro.Api.dll"]
