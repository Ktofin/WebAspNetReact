using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OnlineMarketplace.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class _122222 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserCategories_Users_UserId",
                table: "UserCategories");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "UserCategories",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddForeignKey(
                name: "FK_UserCategories_AspNetUsers_UserId",
                table: "UserCategories",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserCategories_AspNetUsers_UserId",
                table: "UserCategories");

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "UserCategories",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddForeignKey(
                name: "FK_UserCategories_Users_UserId",
                table: "UserCategories",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
