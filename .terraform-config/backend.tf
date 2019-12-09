terraform {
  backend "remote" {
    hostname = "app.terraform.io"
    organization = "FeedbackFruits"

    workspaces {
      name = "feedbackfruits-knowledge"
    }
  }
}
