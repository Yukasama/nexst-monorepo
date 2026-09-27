variable "BUN_VERSION" {
  default = "1.4.2"
}

variable "NEXT_PUBLIC_HOST_URL" {
  default = null
}

variable "NEXT_PUBLIC_API_URL" {
  default = null
}

group "default" {
  # @if worker
  targets = ["api", "worker", "web"]
  # @endif
  # @if !worker
  # targets = ["api", "web"]
  # @endif
}

target "docker-metadata-action" {
  tags = ["nexst:local"]
}

target "base" {
  dockerfile = "Dockerfile.base"
  args = {
    BUN_VERSION = BUN_VERSION
  }
}

target "_app" {
  inherits = ["docker-metadata-action"]
  contexts = {
    toolchain = "target:base"
  }
  platforms = ["linux/arm64"]
}

target "api" {
  inherits   = ["_app"]
  dockerfile = "apps/api/Dockerfile"
  target     = "runtime"
  args = {
    BUN_VERSION = BUN_VERSION
  }
}

target "api-migrate" {
  inherits   = ["_app"]
  dockerfile = "apps/api/Dockerfile"
  target     = "migrator"
  args = {
    BUN_VERSION = BUN_VERSION
  }
}
# @if worker

target "worker" {
  inherits   = ["_app"]
  dockerfile = "apps/worker/Dockerfile"
  args = {
    BUN_VERSION = BUN_VERSION
  }
}
# @endif

target "web" {
  inherits   = ["_app"]
  dockerfile = "apps/web/Dockerfile"
  args = {
    BUN_VERSION          = BUN_VERSION
    NEXT_PUBLIC_HOST_URL = NEXT_PUBLIC_HOST_URL
    NEXT_PUBLIC_API_URL  = NEXT_PUBLIC_API_URL
  }
}
