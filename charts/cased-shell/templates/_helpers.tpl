{{/*
Expand the name of the chart.
*/}}
{{- define "shell.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "shell.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "shell.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "shell.labels" -}}
helm.sh/chart: {{ include "shell.chart" . }}
{{ include "shell.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "shell.selectorLabels" -}}
app.kubernetes.io/name: {{ include "shell.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
SSHD Common labels
*/}}
{{- define "shell.sshd.labels" -}}
helm.sh/chart: {{ include "shell.chart" . }}
{{ include "shell.sshd.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
SSHD Selector labels
*/}}
{{- define "shell.sshd.selectorLabels" -}}
app.kubernetes.io/name: {{ include "shell.name" . }}-sshd
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
vaultInit Common labels
*/}}
{{- define "shell.vaultInit.labels" -}}
helm.sh/chart: {{ include "shell.chart" . }}
{{ include "shell.vaultInit.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
vaultInit Selector labels
*/}}
{{- define "shell.vaultInit.selectorLabels" -}}
app.kubernetes.io/name: {{ include "shell.name" . }}-vault-init
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
vaultUnseal Common labels
*/}}
{{- define "shell.VaultUnsealer.labels" -}}
helm.sh/chart: {{ include "shell.chart" . }}
{{ include "shell.VaultUnsealer.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
vaultUnseal Selector labels
*/}}
{{- define "shell.VaultUnsealer.selectorLabels" -}}
app.kubernetes.io/name: {{ include "shell.name" . }}-vault-unseal
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Cased Server Common labels
*/}}
{{- define "shell.server.labels" -}}
helm.sh/chart: {{ include "shell.chart" . }}
{{ include "shell.server.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Cased Server Selector labels
*/}}
{{- define "shell.server.selectorLabels" -}}
app.kubernetes.io/name: {{ include "shell.name" . }}-cased-server
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Dex Common labels
*/}}
{{- define "dex.labels" -}}
helm.sh/chart: {{ include "shell.chart" . }}
{{ include "dex.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Dex Selector labels
*/}}
{{- define "dex.selectorLabels" -}}
app.kubernetes.io/name: {{ include "shell.name" . }}-dex
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use for shell
*/}}
{{- define "shell.serviceAccountName" -}}
{{- if .Values.config.serviceAccount.create }}
{{- default (include "shell.fullname" .) .Values.config.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.config.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create the name of the service account to use for sshd
*/}}
{{- define "shell.sshd.serviceAccountName" -}}
{{- if .Values.sshd.serviceAccount.create }}
{{- default (printf "%s-%s" (include "shell.fullname" .) "sshd") .Values.sshd.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.sshd.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Postgres Environment Vars
*/}}
{{- define "shell.postgresEnv" -}}
- name: CASED_SHELL_MIGRATE
  value: "true"
- name: CASED_SHELL_SEED
  value: "true"
{{- end }}
