- Prometheus sert a faire le lien entre **l'exporter** et **Grafana**. Il permet a Grafana de comprendre les metrics recuperées 

Dans le ``docker-compose.yml``

```
prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: unless-stopped
    volumes:
      - prometheus_data:/prometheus
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
    ports:
      - "9090:9090"

```

