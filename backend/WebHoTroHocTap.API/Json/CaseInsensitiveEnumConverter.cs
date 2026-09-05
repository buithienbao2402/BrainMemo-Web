using System.Text.Json;
using System.Text.Json.Serialization;

namespace WebHoTroHocTap.API.Json;

/// <summary>
/// Đọc enum từ JSON không phân biệt hoa/thường (client gửi "protected" hay "PROTECTED" đều ra AccessType.PROTECTED).
/// Ghi ra JSON luôn dùng đúng tên enum member (chữ hoa, khớp enum DB).
/// </summary>
public class CaseInsensitiveEnumConverter<TEnum> : JsonConverter<TEnum> where TEnum : struct, Enum
{
    public override TEnum Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var raw = reader.GetString();
        if (raw != null && Enum.TryParse<TEnum>(raw, ignoreCase: true, out var parsed))
        {
            return parsed;
        }

        throw new JsonException(
            $"Giá trị '{raw}' không hợp lệ cho {typeof(TEnum).Name}. " +
            $"Giá trị hợp lệ: {string.Join(", ", Enum.GetNames(typeof(TEnum)))}.");
    }

    public override void Write(Utf8JsonWriter writer, TEnum value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString());
    }
}