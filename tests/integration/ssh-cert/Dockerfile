FROM alpine:edge

# Prevent some openrc error messages.
VOLUME /sys/fs/cgroup

WORKDIR /run
COPY sshd_updater.sh /run

RUN apk update && apk add openrc openssh bash &&\
    # Generate host SSH keys
    ssh-keygen -A && \
    # Tell openrc its running inside a container, till now that has meant LXC
    sed -i 's/#rc_sys=""/rc_sys="lxc"/g' /etc/rc.conf &&\
    # Tell openrc loopback and net are already there, since docker handles the networking
    echo 'rc_provide="loopback net"' >> /etc/rc.conf &&\
    # no need for loggers
    sed -i 's/^#\(rc_logger="YES"\)$/\1/' /etc/rc.conf &&\
    # can't get ttys unless you run the container in privileged mode
    sed -i '/tty/d' /etc/inittab &&\
    # can't set hostname since docker sets it
    sed -i 's/hostname $opts/# hostname $opts/g' /etc/init.d/hostname &&\
    # can't mount tmpfs since not privileged
    sed -i 's/mount -t tmpfs/# mount -t tmpfs/g' /lib/rc/sh/init.sh &&\
    # can't do cgroups
    sed -i 's/cgroup_add_service /# cgroup_add_service /g' /lib/rc/sh/openrc-run.sh &&\
    # clean apk cache
    rm -rf /var/cache/apk/* &&\
    # Tell openrc it's not the bootup script.
    mkdir -p /run/openrc && \
    touch /run/openrc/softlevel && \
    # Change root password
    echo 'root:root' | chpasswd

ENTRYPOINT ["sh", "-c", "rc-status; rc-service sshd start; /run/sshd_updater.sh"]
