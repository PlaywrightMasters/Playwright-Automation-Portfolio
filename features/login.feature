@ui
Feature: Sign in to the shop
  As a customer
  I want to sign in with my account
  So that I can browse and buy products

  Background:
    Given I am on the login page

  @smoke
  Scenario: A registered customer signs in
    When I sign in as "standard_user" with password "secret_sauce"
    Then I see the products page

  Scenario: A locked-out customer cannot sign in
    When I sign in as "locked_out_user" with password "secret_sauce"
    Then I see the login error "this user has been locked out"

  Scenario Outline: Sign-in is rejected for invalid input (<case>)
    When I sign in as "<username>" with password "<password>"
    Then I see the login error "<error>"

    Examples:
      | case           | username      | password     | error                                       |
      | empty username |               | secret_sauce | Username is required                        |
      | empty password | standard_user |              | Password is required                        |
      | wrong password | standard_user | wrong_pass   | Username and password do not match any user |
