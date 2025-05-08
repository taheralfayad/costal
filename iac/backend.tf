terraform {
  backend "s3" {
    bucket         = "costal-tf-state"
    key            = "costal/main.tfstate"
    region         = "us-east-1"
    dynamodb_table = "costal-tf-locks"
    encrypt        = true
  }
}
