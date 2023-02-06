# syntax=docker/dockerfile:1.4

FROM debian:11

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
  curl \
  libexpat1 \
  locales \
  openssh-server \
  python3 \
  ; \
  rm -rfv /etc/ssh/ssh_host*

RUN echo "en_US.UTF-8 UTF-8" > /etc/locale.gen && \
    dpkg-reconfigure --frontend=noninteractive locales && \
    locale-gen && \
    echo "export LANG=en_US.UTF-8" > /etc/profile.d/lang.sh

RUN mkdir /var/run/sshd && \
  sed -ri 's/UsePAM yes/#UsePAM yes/g' /etc/ssh/sshd_config && \
  useradd -ms /bin/bash app && \
  usermod -p '*' app && \
  mkdir /home/app/.ssh && \
  touch /home/app/.ssh/authorized_keys && \
  chown -R app:app /home/app && \
  chmod 700 /home/app/.ssh && \
  chmod 600 /home/app/.ssh/authorized_keys

RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

EXPOSE 22

COPY --from=bitnami/kubectl:1.25.3 --link /opt/bitnami/kubectl/bin/kubectl /usr/local/bin/kubectl
RUN echo "export KUBERNETES_SERVICE_HOST=kubernetes.default" >> /etc/profile.d/k8s.sh && \
    echo "export KUBERNETES_SERVICE_PORT=443" >> /etc/profile.d/k8s.sh


CMD    ["/bin/bash", "-xec", "dpkg-reconfigure openssh-server; exec /usr/sbin/sshd -D -e"]
